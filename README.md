# Papago-Chat

## 개요

- **프로젝트 명**: Papago Chat
- **개발 인원**: 1명
- **개발 기간**: 2023.02.11 ~ 2023.03.10
- **주요 기능**:
    - 계정
        - 회원가입, 로그인, 중복 검사
    - 관계
        - 친구 추가 및 삭제
    - 채팅방
        - 채팅방 개설, 참가, 나가기, 인원 확인
    - 소통
        - 이전 채팅 내역 출력과 실시간 대화
    - 번역
        - 채팅 번역 기능
- **개발 언어**: <img src="[https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=node.js&logoColor=white](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)"> <img src="[https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white](https://img.shields.io/badge/express-000000?style=for-the-badge&logo=express&logoColor=white)"> <img src="[https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white](https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)">
- **개발 환경**: VS Code
- **데이터베이스**: <img src="[https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white](https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white)">
- **형상관리 툴**: GitHub
- **간단 소개**: 실시간으로 번역되는 대화를 주고받을 수 있는 채팅 앱

---

## 요구사항 분석

1. **회원가입 페이지**
    - 중복확인:
        - 데이터베이스에 존재하는 이메일을 입력한 채 가입하기 버튼을 누를 경우 ‘이미 등록된 이메일입니다.’ 메시지 출력하기
        - 중복된 이메일이 없다면 비밀번호 암호화(SHA256) 후 계정 정보를 데이터베이스에 저장하기
2. **로그인 페이지**
    - 세션:
        - 세션에 로그인 정보가 있다면 메인 페이지로 이동시키기
    - 로그인 검사:
        - 아이디와 비밀번호가 일치하지 않을 시 ‘유효하지 않은 이메일 또는 비밀번호입니다.’ 메시지 출력하기
        - 이외의 다른 에러 메시지 또한 처리하기
        - 모든 검사 통과 시 세션 저장, 로그인 후 메인 페이지로 이동시키기
3. **계정**
    - 설정:
        - 프로필 이미지 업로드 기능
        - 데이터베이스에 저장된 계정 정보 출력하기
        - 계정 삭제 또는 로그아웃 버튼 클릭 시 확인 메시지 출력하기
        - 계정 삭제 시 데이터베이스 내 계정 정보 제거하기
        - 계정 삭제 또는 로그아웃 시 로그인 세션 삭제한 뒤 로그인 페이지로 이동하기
4. **목록**
    - 친구:
        - ‘사용자명#태그’의 조합을 통해 친구 추가하기
        - 이름또는 태그가 일치하지 않을 경우 ‘이름과 태그가 정확한지 다시 한 번 확인해주세요.’ 메시지 출력하기
        - 친구 목록 우측 X 버튼을 누를 시 해당 친구와의 관계 제거하기
    - 채팅방:
        - 새 채팅방 개설하기 버튼으로 여러 사람과 대화를 나눌 수 있는 채팅방 생성
        - 입장 코드가 유효하지 않을 경우 ‘유효한 입장 코드를 입력하세요’ 메시지 출력하기
        - 입장 코드가 유효할 경우 해당 채팅방에 입장하기
    - 목록 출력:
        - 친구 관계를 맺었거나, 소속된 채팅방 목록 출력하기
        - 읽지 않은 메시지 개수 출력하기
        - 채팅방의 경우, 마지막으로 수신한 메시지 출력하기
5. **채팅 관련**
    - 송신:
        - 메시지 입력 후 엔터 키 누르면 유효성 검사, 입력 값이 공백이라면 송신하지 않음
        - ㄱ서버로 입력 값 전송, 데이터베이스에 저장 후 채팅방에 입장한 사람들에게 메시지 데이터 전송하기
    - 수신:
        - 채팅방 입장 시 이전 메시지 내역을 불러와 페이지 양식에 맞게 출력하기
        - 이전 메시지 내역이 없다면 ‘대화 기록이 없어요’ 메시지 출력하기
        - 서버로부터 메시지 데이터(보낸 유저 정보, 시간, 메시지, 번역된 메시지)를 받으면 페이지 양식에 맞게 출력하기
    - 친구 전용 설정:
        - 친구로 등록되지 않은 사용자로부터 메시지를 수신했다면 ‘아직 친구로 등록되지 않은 사용자에요.’ 메시지와 함께 친구 등록 버튼 출력하기
    - 채팅방 전용 설정:
        - 채팅방에 소속된 인원 확인하기
        - 입장 코드 확인 및 복사 기능
        - 채팅방 나가기 버튼 클릭 시 확인 메시지 출력하기
