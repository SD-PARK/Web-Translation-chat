const roomList = $('#room-list');
const roomsMap = new Map();

/**
 * 방 목록에 행을 추가합니다.
 * @param {object} data - 방과 관련된 데이터가 포함된 객체
 */
function addCol(data) {
    roomList.append(`
    <div class="col ${data?.room_id}" onclick="joinRoom(${data?.room_id})">
      <span class="room-id">${data?.room_id ?? ''}</span>
      <span class="cnt">${data?.cnt ?? '0'}/∞</span>
      <p class="title">${data?.room_name ?? ''}</p>
    </div>`);
}

/**
 * 특정 방의 데이터를 업데이트합니다.
 * @param {object} data 
 */
function updateCol(data) {
  const col = $(`.${data?.room_id}`);
  if (col.length > 0) {
      for (const key in data) {
          const div = col.find(`.${key}`);
          div.text(`${data[key]}`);
          if (key === 'cnt') div.append('/∞');
      }
  } else {
    addCol(data);
  }
}

/** 채팅 페이지로 이동합니다. */
function joinRoom(roomId) {
  location.href=`/chat/${roomId}`;
}

/** 방 목록을 초기화합니다. */
function listClear() {
  roomList.empty();
}

/** 필터 기준으로 목록을 재생성합니다. */
function filterSearch() {
  const filterTitle = $('#filter-title').val();
  listClear();
  roomsMap.forEach((value, key) => {
      if (value?.room_name.includes(filterTitle)) {
          addCol(value);
      };
  });
}

// input에서 엔터 키 입력 시 버튼 클릭 이벤트 실행
$("#filter-title").keyup(function(event) {
  if (event.which === 13) {
      $("#filter-search").click();
  }
});