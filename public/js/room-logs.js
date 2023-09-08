const roomList = $('#room-list');

/**
 * 방 목록에 행을 추가합니다.
 * @param {object} data - 방과 관련된 데이터가 포함된 객체
 */
function addCol(data) {
    roomList.append(`
    <div class="col ${data?.room_id}" onclick="joinRoom(${data?.room_id})">
      <span class="room-id">${data?.room_id ?? ''}</span>
      <span class="cnt">${data?.cnt ?? '?'}/∞</span>
      <p class="title">${data?.room_name ?? ''}</p>
    </div>`);
}

function joinRoom(roomId) {
  location.href=`/chat/${roomId}`;
}