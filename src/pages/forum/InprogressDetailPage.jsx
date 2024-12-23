import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  getBestComment,
  writeComment,
  addLike,
  addDislike,
} from "../../api/forum/forumCommentApi.js";
import BasicLayout from "../../layouts/BasicLayout";
import { PrevTitle, PrevTitleReport } from "../../layouts/TopLayout";
import { getForumDetail } from "../../api/forum/forumApi.js";
import ForumTitle from "../../components/forum/ForumTitle.jsx";
import ForumContent from "../../components/forum/ForumContent.jsx";
import useCustomLogin from "../../hooks/useCustomLogin.js";
import AddReportModal from "../../components/modal/forum/AddReportModal.jsx";
import {
  PiCaretRightBold,
  PiChatCenteredDots,
  PiMedalMilitaryFill,
} from "react-icons/pi";
import CommentList from "../../components/forum/CommentList.jsx";
import WriteComment from "../../components/forum/WriteComment.jsx";

// 진행중 토론 상세
const InprogressDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginState } = useCustomLogin();

  const { discussionId } = useParams();
  const [forum, setForum] = useState({});
  const [bestComments, setBestComments] = useState([]);
  const [isAuthor, setIsAuthor] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null); // 선택된 댓글
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // 신고 모달 상태
  const [refreshReport, setRefreshReport] = useState(false);
  const [refreshBest, setRefreshBest] = useState(false);

  const { prevActiveTab, prevSearch, prevSort, prevScrollLeft } =
    location?.state || {};

  // 작성자와 로그인 유저 일치 여부
  useEffect(() => {
    setIsAuthor(forum.memberName === loginState.nickname);
  }, [forum, loginState]);

  // 토론 상세 API 호출
  useEffect(() => {
    fetchForum(discussionId); // API 호출
  }, [discussionId, refreshReport]);

  // 베스트댓글 상세 API 호출
  useEffect(() => {
    console.log("*****베스트댓글 discussionId:", discussionId);
    fetchBestComment(discussionId); // API 호출
  }, [discussionId, refreshBest]);

  // 토론 상세 API
  const fetchForum = async (discussionId) => {
    try {
      const res = await getForumDetail(discussionId);
      setForum(res);
      console.log("상세 데이터:", res);
    } catch (err) {
      console.error("API 호출 중 오류:", err);
    }
  };

  // 베스트 댓글 API
  const fetchBestComment = async (discussionId) => {
    try {
      const res = await getBestComment(discussionId);
      setBestComments(res);
      console.log("베댓 데이터:", res);
    } catch (err) {
      console.error("API 호출 중 오류:", err);
    }
  };

  // 댓글 작성 API
  const fetchWriteComment = async (discussionId, voteType, comment) => {
    try {
      const res = await writeComment(discussionId, voteType, comment);
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  // 댓글 좋아요 API
  const fetchAddLike = async (commentId) => {
    try {
      const res = await addLike(commentId);
      setRefreshBest((prev) => !prev);
      return res;
    } catch (err) {
      console.error("API 호출 중 오류:", err);
    }
  };

  // 댓글 싫어요 API
  const fetchAddDislike = async (commentId) => {
    try {
      const res = await addDislike(commentId);
      setRefreshBest((prev) => !prev);
      return res;
    } catch (err) {
      console.error("API 호출 중 오류:", err);
    }
  };

  // 뒤로가기, 신고 버튼
  const handleActionClick = (action, comment = null) => {
    if (action === "back") {
      console.log("discussionId : ", discussionId);
      navigate("/forum/list", {
        replace: true,
        state: {
          prevActiveTab,
          prevSearch,
          prevSort,
          prevScrollLeft,
        },
      });
    } else if (action === "report" && comment) {
      console.log("신고할 댓글: ", comment); // 선택된 댓글 정보 출력
      setSelectedComment(comment); // 선택된 댓글 설정
      setIsReportModalOpen(true); // 신고 모달 열기
    } else if (action === "report") {
      setIsReportModalOpen(true); // 신고 모달 열기
    }
  };

  // 신고 모달 취소
  const handleReportCancel = () => {
    setIsReportModalOpen(false); // 신고 모달 닫기
  };

  // 신고 모달 확인
  const handleReportConfirm = (selectedReason) => {
    console.log("신고 사유:", selectedReason);
    setIsReportModalOpen(false); // 신고 모달 닫기
    // TODO: 신고 처리 로직 추가
  };

  // 의견 더보기 클릭
  const handleMoreComment = () => {
    navigate(`/forum/opinions/${discussionId}`, {
      replace: true,
      state: {
        forum,
        prevActiveTab,
        prevSearch,
        prevSort,
        prevScrollLeft,
      },
    });
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = async (voteType, comment) => {
    try {
      await fetchWriteComment(discussionId, voteType, comment);
      navigate(`/forum/opinions/${discussionId}`, {
        replace: true,
        state: {
          forum,
          prevActiveTab,
          prevSearch,
          prevSort,
          prevScrollLeft,
        },
      });
      return true; // 성공 시 true 반환
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      return false; // 실패 시 false 반환
    }
  };

  // 댓글 좋아요 핸들러
  const handleAddLike = async (commentId) => {
    try {
      const response = await fetchAddLike(commentId);
      // 좋아요 성공 시 댓글 목록 업데이트
      console.log("좋아요 성공:", response);
      return response; // 성공 시 true 반환
    } catch (error) {
      console.error("댓글 좋아요 실패:", error);
    }
  };

  // 댓글 싫어요 핸들러
  const handleAddDislike = async (commentId) => {
    try {
      const response = await fetchAddDislike(commentId);
      // 좋아요 성공 시 댓글 목록 업데이트
      console.log("싫어요 성공:", response);
      return response; // 성공 시 true 반환
    } catch (error) {
      console.error("댓글 싫어요 실패:", error);
    }
  };

  return (
    <BasicLayout>
      <div className="w-full fixed top-0 bg-undbgmain">
        {isAuthor || forum.viewStatus === "BLOCKED" ? (
          <PrevTitle
            title={"토론 진행 중"}
            onClick={() => handleActionClick("back")} // 뒤로 가기 버튼
            showLine={false}
          />
        ) : (
          <PrevTitleReport
            title={"토론 진행 중"}
            onClick={handleActionClick} // 뒤로 가기, 신고 버튼
            showLine={false}
            isReport={forum.isReport}
          />
        )}
      </div>
      <div className="flex flex-col pt-16 pb-20 px-6">
        <ForumTitle forum={forum} />
        {forum.viewStatus === "BLOCKED" ? (
          <div className="mt-4 text-start text-undtextgray font-bold">
            관리자에 의해 차단된 글입니다
          </div>
        ) : (
          <>
            <ForumContent forum={forum} />
            <div className="flex flex-col border-t border-unddisabled text-und14 text-left pt-4">
              <div className="flex w-full justify-between pb-4">
                <div className="flex gap-0.5 font-extrabold items-center">
                  {bestComments.length !== 0 ? (
                    <div className="flex text-center items-center text-und16 font-extrabold text-undred justify-start gap-1">
                      <div>
                        <PiMedalMilitaryFill size={20} color="#D55636" />
                      </div>
                      <p className="flex w-full">BEST 의견</p>
                    </div>
                  ) : (
                    <p className="flex w-full font-extrabold text-und16">
                      의견
                    </p>
                  )}
                </div>
                <div
                  className="flex gap-1 items-center text-undtextgray"
                  onClick={handleMoreComment}
                >
                  <div className="flex text-center items-center font-bold gap-0.5">
                    {" "}
                    <PiChatCenteredDots size={18} color="78716C" />
                    <div className="flex gap-1 text-und14">
                      <p className="text-undtextgray">전체 보기</p>
                      <p className="text-undtextdark font-extrabold">
                        {forum.commentCount}
                      </p>
                    </div>
                  </div>
                  <PiCaretRightBold />
                </div>
              </div>
              {bestComments && (
                <CommentList
                  comments={bestComments}
                  forum={forum}
                  onClickReport={(comment) =>
                    handleActionClick("report", comment)
                  } // 클릭된 댓글 전달
                  onClickLike={handleAddLike} // 좋아요
                  onClickDislike={handleAddDislike} // 좋아요
                />
              )}
              <WriteComment onClick={handleCommentSubmit} />
            </div>
          </>
        )}
      </div>
      {/* 신고 모달 */}
      {isReportModalOpen && (
        <AddReportModal
          onCancel={handleReportCancel} // 취소 클릭 시 모달 닫기
          onConfirm={(reason) => {
            handleReportConfirm(reason); // 확인 클릭 시 처리
          }}
          forum={forum}
          comment={selectedComment}
          refresh={() => setRefreshReport((prev) => !prev)}
        />
      )}
    </BasicLayout>
  );
};

export default InprogressDetailPage;
