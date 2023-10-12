// input에서 엔터 키 입력 시 버튼 클릭 이벤트 실행
function enterTitleEnter(e) {
  if (e.which === 13) {
    $("#enter-alert").click();
  } else if (e.keyCode === 27) {
    closeAlert();
  }
}