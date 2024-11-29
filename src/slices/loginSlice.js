import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginPost } from '../api/loginApi';
import { getCookie, removeCookie, setCookie } from '../util/cookieUtil';
import { getAccessToken, getMemberWithAccessToken } from '../api/kakaoApi';

const initState = {
  email: '',
  socialInfo: null,
  loginType: 'normal', // 'normal' | 'kakao'
};

const loadMemberCookie = () => {
  const memberInfo = getCookie('member');
  return memberInfo;
};

// 기존 일반 로그인 thunk
export const loginPostAsync = createAsyncThunk('loginPostAsync', (param) =>
  loginPost(param)
);

// 카카오 로그인을 위한 새로운 thunk
export const kakaoLoginAsync = createAsyncThunk(
  'kakaoLoginAsync',
  async (authCode) => {
    const accessToken = await getAccessToken(authCode);
    const result = await getMemberWithAccessToken(accessToken);

    if (result.result === 'exists') {
      // 기존 회원인 경우 자동 로그인 처리
      const loginResponse = await loginPost({
        username: result.member.username,
        password: "pw_" + result.member.username,
      });

      console.log('loginResponse : {}', loginResponse);

      return {
        ...loginResponse,
        loginType: 'kakao',
      };
    }

    // 신규 회원인 경우 회원가입 필요 정보 반환
    return {
      needsSignup: true,
      kakaoInfo: result.kakaoId,
      loginType: 'kakao',
    };
  }
);

const loginSlice = createSlice({
  name: 'loginSlice',
  initialState: loadMemberCookie() || initState,
  reducers: {
    login: (state, action) => {
      console.log('login......', action);
      console.log(action.payload);
      console.log('-----------------------');

      setCookie("member", JSON.stringify(action.payload), 1);

      return action.payload;
    },
    logout: () => {
      console.log('logout.....');

      removeCookie('member');

      return { ...initState };
    },
  },
  extraReducers: (builder) => {
    builder
      // 일반 로그인 처리
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        console.log('fullfilled');

        const payload = action.payload;

        if (!payload.error) {
          setCookie('member', JSON.stringify(payload), 1);
        }

        return payload;
      })

      .addCase(loginPostAsync.pending, (state, action) => {
        console.log('pending');
      })

      .addCase(loginPostAsync.rejected, (state, action) => {
        console.log('rejected');
      })

      // 카카오 로그인 처리
      .addCase(kakaoLoginAsync.fulfilled, (state, action) => {
        const payload = action.payload;

        if (!payload.error) {
          // 로그인 성공 시 쿠키 설정
          setCookie('member', JSON.stringify(payload), 1);
        }

        return payload;
      })
      .addCase(kakaoLoginAsync.rejected, (state, action) => {
        console.log('Kakao login failed:', action.error);
      });
  },
});

export const { login, logout } = loginSlice.actions;

export default loginSlice.reducer;
