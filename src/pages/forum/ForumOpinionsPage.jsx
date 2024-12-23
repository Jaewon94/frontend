import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import BasicLayout from "../../layouts/BasicLayout.jsx";
import { PrevTitle } from "../../layouts/TopLayout.jsx";
import {
  getCommentList,
  writeComment,
  writeReply,
  addLike,
  addDislike,
} from "../../api/forum/forumCommentApi.js";
import useCustomLogin from "../../hooks/useCustomLogin.js";
import AddReportModal from "../../components/modal/forum/AddReportModal.jsx";
import CommentList from "../../components/forum/CommentList.jsx";
import WriteComment from "../../components/forum/WriteComment.jsx";

// 진행중 토론 의견 목록
const ForumOpinionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginState } = useCustomLogin();

  const { discussionId } = useParams();
  // const [forum, setForum] = useState({});
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState();
  const [lastId, setLastId] = useState();
  const [totalElements, setTotalElements] = useState();
  const [isAuthor, setIsAuthor] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // 신고 모달 상태
  const [activeComment, setActiveComment] = useState(null); // 활성화된 댓글 관리
  const [selectedComment, setSelectedComment] = useState(null); // 선택된 댓글

  const observer = useRef(null);
  const sentinelRef = useRef(null);

  const { forum, prevActiveTab, prevSearch, prevSort, prevScrollLeft } =
    location?.state || {};

  // 작성자와 로그인 유저 일치 여부
  useEffect(() => {
    setIsAuthor(forum.memberName === loginState.nickname);
  }, [forum, loginState]);

  // 모든 댓글 상세 API 호출
  useEffect(() => {
    fetchCommentList(); // API 호출
  }, [discussionId]);

  useEffect(() => {
    if (sentinelRef.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !loading && hasNext) {
            setLoading(true);
            fetchCommentList(lastId);
          }
        },
        { threshold: 1.0 }
      );
      observer.current.observe(sentinelRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasNext]);

  // 모든 댓글 API
  const fetchCommentList = async (lastId = null) => {
    try {
      setLoading(true);
      const res = await getCommentList(discussionId, lastId);

      if (lastId) {
        setComments((prevComments) => [...prevComments, ...res.content]);
      } else {
        setComments(res.content);
      }
      console.log("모든 댓글", res);
      setHasNext(res.hasNext);
      setLastId(res.lastId);
      setTotalElements(res.totalElements);
      setLoading(false);
      return res;
    } catch (err) {
      console.error("API 호출 중 오류:", err);
      setLoading(false);
    }
  };

  // 댓글 좋아요 API
  const fetchAddLike = async (commentId) => {
    try {
      const res = await addLike(commentId);
      return res;
    } catch (err) {
      console.error("API 호출 중 오류:", err);
    }
  };

  // 댓글 싫어요 API
  const fetchAddDislike = async (commentId) => {
    try {
      const res = await addDislike(commentId);
      return res;
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

  // 대댓글 작성 API
  const fetchWriteReply = async (
    discussionId,
    discussionCommentId,
    voteType,
    comment
  ) => {
    try {
      const res = await writeReply(
        discussionId,
        discussionCommentId,
        voteType,
        comment
      );
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  // 뒤로가기, 신고 버튼
  const handleActionClick = async (action, comment = null) => {
    if (action === "back") {
      const targetPath =
        forum?.status !== "COMPLETED"
          ? `../inprogress/${discussionId}`
          : `../completed/${discussionId}`;

      navigate(targetPath, {
        replace: true,
        state: {
          forum,
          prevActiveTab,
          prevSearch,
          prevSort,
          prevScrollLeft,
        },
      });
    } else if (action === "report" && comment) {
      setSelectedComment(comment); // 선택된 댓글 설정
      setIsReportModalOpen(true); // 신고 모달 열기
    }
  };

  // 신고 모달 취소
  const handleReportCancel = () => {
    setSelectedComment(null); // 선택된 댓글 초기화
    setIsReportModalOpen(false); // 신고 모달 닫기
  };

  // 신고 모달 확인
  const handleReportConfirm = (selectedReason) => {
    setIsReportModalOpen(false); // 신고 모달 닫기
    // TODO: 신고 처리 로직 추가
  };

  // 댓글 좋아요 핸들러
  const handleAddLike = async (commentId) => {
    try {
      const response = await fetchAddLike(commentId);
      if (response.result === "success") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.commentId === response.data.commentId
              ? { ...comment, ...response.data }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("댓글 좋아요 실패:", error);
    }
  };

  // 댓글 싫어요 핸들러
  const handleAddDislike = async (commentId) => {
    try {
      const response = await fetchAddDislike(commentId);
      if (response.result === "success") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.commentId === response.data.commentId
              ? { ...comment, ...response.data }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("댓글 싫어요 실패:", error);
    }
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = async (voteType, comment) => {
    try {
      await fetchWriteComment(discussionId, voteType, comment);
      fetchCommentList(discussionId); // 대댓글 작성 후 댓글 목록 업데이트
      return true; // 성공 시 true 반환
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      return false; // 실패 시 false 반환
    }
  };

  // 대댓글 작성 핸들러
  const handleReplySubmit = async (discussionCommentId, voteType, comment) => {
    try {
      await fetchWriteReply(
        discussionId,
        discussionCommentId,
        voteType,
        comment
      );
      fetchCommentList(); // 대댓글 작성 후 댓글 목록 업데이트
      setActiveComment(null); // 입력창 닫기

      return true; // 성공 시 true 반환
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      return false; // 실패 시 false 반환
    }
  };

  return (
    <BasicLayout>
      <div className="w-full fixed top-0 bg-undbgmain">
        <PrevTitle
          title={`의견(${totalElements}개)`}
          onClick={() => handleActionClick("back")} // 뒤로 가기 버튼
          showLine={false}
        />
      </div>
      <div className="flex flex-col pt-16 pb-16 px-6 gap-1">
        <CommentList
          comments={comments}
          forum={forum}
          handleReplySubmit={handleReplySubmit}
          onClickReport={(comment) => handleActionClick("report", comment)} // 신고
          onClickLike={handleAddLike} // 좋아요
          onClickDislike={handleAddDislike} // 좋아요
        />

        {/* Sentinel item - 마지막 아이템을 감지하는 요소 */}
        {totalElements > 0 && !loading && (
          <div ref={sentinelRef} className="h-1"></div>
        )}

        {forum?.status !== "COMPLETED" && (
          <WriteComment onClick={handleCommentSubmit} />
        )}
      </div>

      {/* 신고 모달 */}
      {isReportModalOpen && (
        <AddReportModal
          onCancel={handleReportCancel} // 취소 클릭 시 모달 닫기
          onConfirm={(reason) => {
            handleReportConfirm(reason); // 확인 클릭 시 처리
          }}
          // forum={forum}
          comment={selectedComment}
          setComments={setComments}
        />
      )}
    </BasicLayout>
  );
};

export default ForumOpinionsPage;
