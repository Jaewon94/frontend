import { useEffect, useState } from "react";
import SlrModalLayout from "../../../layouts/SlrModalLayout";
import StateBox from "../../myBook/StateBox";
import { addBook, modifyBook } from "../../../api/book/bookApi";
import TwoButtonModal from "../commons/TwoButtonModal";
import MyBookInputs from "../../myBook/MyBookInputs";

const initData = {
  title: "",
  author: "",
  customerReviewRank: 0,
  subInfo: { itemPage: 0 },
};

const MyBookModal = ({ mode, onClose, state = "READING", book = initData }) => {
  const [boxState, setBoxState] = useState(state);
  const [isReady, setIsReady] = useState(false);
  const [bookInput, setBookInput] = useState({}); // api로 보낼 데이터 값
  const [bookInfo, setBookInfo] = useState({}); // 화면에 뿌려줄 기본값 ADD 면 빈 값, MODIFY 면 기존 값
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    setBookInfo(initializeBookInfo(mode, book));
  }, [mode, book]);

  useEffect(() => {
    setBookInput(initializeBookInput(boxState));
  }, [boxState, mode, state, book]);

  useEffect(() => {
    console.log("api will take : ", bookInput);
  }, [bookInput]);

  const initializeBookInfo = (mode, book) => ({
    title: book.title,
    author: book.author,
    customerReviewRank: book.customerReviewRank,
    myRating: mode === "ADD" ? 5 : book?.myRating ?? 5,
    startDate: mode === "ADD" ? "today" : book?.startDate ?? "today",
    endDate: mode === "ADD" ? "today" : book?.endDate ?? "today",
    oneLineReview: mode === "ADD" ? "" : book?.oneLineReview ?? "",
    currentPage: mode === "ADD" ? 0 : book?.currentPage ?? 0,
    itemPage: mode === "ADD" ? book.subInfo.itemPage : book.itemPage,
    updateCount: mode === "ADD" ? 0 : book.updateCount,
  });

  const initializeBookInput = (boxState) => ({
    status: boxState,
  });

  const fetchModifyBook = async () => {
    try {
      const res = await modifyBook(book.id, bookInput);
      console.log(res);
      if (res.data.result === "success") onClose();
      return "success";
    } catch (err) {
      console.error(err);
      return "error";
    }
  };

  const fetchAddBook = async () => {
    const data = {
      aladinBookRequestDTO: {
        isbn13: book.isbn13,
        title: book.title,
        author: book.author,
        link: book.link,
        cover: book.cover,
        fullDescription: book.fullDescription,
        fullDescription2: book.fullDescription2,
        publisher: book.publisher,
        categoryName: book.categoryName,
        customerReviewRank: book.customerReviewRank,
        itemPage: book.subInfo.itemPage,
      },
      bookStatusRequestDTO: bookInput,
    };

    try {
      // 성공 토스트메세지
      const res = await addBook(data);
      console.log(res);
      if (res.data.result === "success") onClose();
      return "success";
    } catch (err) {
      console.error(err);
      // 실패 토스트메세지
      return "error";
    }
  };

  const handleReadyToAdd = (boolean, value) => {
    setBookInput(value);

    if (boolean) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  };

  const handleTabState = (tab) => {
    setBoxState(tab);
    setIsReady(false);
  };

  const handleConfirmModalOpen = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmModalClose = () => {
    setConfirmModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const result =
        mode === "ADD" ? await fetchAddBook() : await fetchModifyBook();
      if (result === "success") {
        onClose(); // 모달 닫기
      }
    } catch (error) {
      console.error("Error while handling click:", error);
    }
  };

  const getModalMessage = () => {
    if (mode === "ADD") {
      return ["책 담기를 완료했습니다", "내 책장으로 이동하시겠습니까?"];
    } else if (book.status === "WISH") {
      return [`${boxState}으로 수정하시겠습니까?`];
    } else {
      return ["기존 정보가 사라질 수 있어요", "수정하시겠습니까?"];
    }
  };

  return (
    <SlrModalLayout onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between gap-3">
            <StateBox
              state={"READING"}
              isActive={boxState === "READING"}
              setActive={handleTabState}
            />
            <StateBox
              state={"WISH"}
              isActive={boxState === "WISH"}
              setActive={handleTabState}
            />
          </div>
          <div className="flex justify-between gap-3">
            <StateBox
              state={"COMPLETED"}
              isActive={boxState === "COMPLETED"}
              setActive={handleTabState}
            />
            <StateBox
              state={"STOPPED"}
              isActive={boxState === "STOPPED"}
              setActive={handleTabState}
            />
          </div>
        </div>
        <MyBookInputs
          mode={mode}
          state={boxState}
          setReady={handleReadyToAdd}
          book={bookInfo}
        />
      </div>
      <div className="fixed px-6 w-full bottom-8 start-0 end-0 mt-4 flex justify-center items-center">
        <div className="flex w-full justify-center items-center">
          <button
            className={`w-full h-12 rounded-full text-und18 ${
              isReady
                ? "bg-undpoint text-white"
                : "bg-unddisabled text-undtextgray"
            } font-bold`}
            disabled={!isReady}
            onClick={handleConfirmModalOpen}
          >
            {mode === "ADD" ? "책 담기" : "수정하기"}
          </button>
        </div>
      </div>
      {confirmModalOpen && (
        <TwoButtonModal
          onCancel={handleConfirmModalClose}
          onConfirm={handleSubmit}
        >
          {getModalMessage().map((message, index) => (
            <p className="text-und16 text-undclickbrown font-bold" key={index}>
              {message}
            </p>
          ))}
        </TwoButtonModal>
      )}
    </SlrModalLayout>
  );
};

export default MyBookModal;
