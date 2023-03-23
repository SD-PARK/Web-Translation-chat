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
        - 각 언어 별 출력 텍스트 변경
- **개발 언어**: Node.js(Express), Socket.io
- **개발 환경**: VS Code
- **데이터베이스**: MySQL
- **형상관리 툴**: GitHub
- **간단 소개**: 실시간으로 번역되는 대화를 주고받을 수 있는 채팅 앱

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
    - 언어:
        - 설정한 언어에 따른 출력 텍스트 변경하기
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
        - 서버로 입력 값 전송, 데이터베이스에 저장 후 채팅방에 입장한 사람들에게 메시지 데이터 전송하기
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


## DB 설계

![erd](https://user-images.githubusercontent.com/97375357/227104504-872de0ac-364c-40f8-9d30-a17a9d62aeb7.png)


## API 설계

![api](https://user-images.githubusercontent.com/97375357/227107760-1676bd66-9650-42d7-9d35-05c20e433055.png)


## 화면 설계

<details>
<summary><h3>로그인</h3></summary>
<hr>
<h4>1. 로그인 페이지(한글)</h4>
<img src="https://user-images.githubusercontent.com/97375357/227117914-262c35f0-b940-426d-84a4-43b7e0521a4f.png" width="500"/>
<hr>
<h4>2. 로그인 페이지(영어)</h4>
<img src="https://user-images.githubusercontent.com/97375357/227117907-3a167115-a3eb-4886-afb9-6bb5b88d5ed9.png" width="500"/>

우측 상단 SelectBox를 통해 지원 언어를 변경할 수 있다.
<hr>
</details>

<details>
<summary><h3>회원가입</h3></summary>
<hr>
<h4>1. 회원가입 페이지(한글)</h4>
<img src="https://user-images.githubusercontent.com/97375357/227120022-6fa06e00-7b31-4e40-a081-185f21823042.png" width="500"/>
<hr>
<h4>2. 회원가입 페이지(일본어)</h4>
<img src="https://user-images.githubusercontent.com/97375357/227120019-1514e1cb-1d1c-4b61-bb7b-f5c1d45b3ac4.png" width="500"/>

로그인 페이지에서 설정한 언어를 쿠키를 통해 가져와 이어서 적용한다.

SelectBox를 통해 동일하게 지원 언어 변경 가능.
<hr>
</details>

<details>
<summary><h3>프로필</h3></summary>
<hr>
<h4>1. 프로필 페이지</h4>
<img src="https://user-images.githubusercontent.com/97375357/227120560-270ff1ec-02d2-4f19-a9e0-a8e46c2ec766.png" width="500"/>

데이터베이스에 저장된 계정 정보를 불러온다.

프로필 이미지를 클릭하면 이미지를 업로드할 수 있다.
<hr>
<h4>2. 프로필 페이지(업로드 후)</h4>
<img src="https://user-images.githubusercontent.com/97375357/227120561-831d9578-e351-4fb4-8985-86d720f80305.png" width="500"/>
<hr>
</details>

<details>
<summary><h3>친구, 채팅방 목록</h3></summary>
<hr>
<h4>1. 친구 목록</h4>
<img src="https://user-images.githubusercontent.com/97375357/227121298-041681f4-7bf6-42fd-b5be-97e87cbefbbf.png" width="200"/>

친구 목록을 불러온다.

친구를 클릭하면 1:1 채팅방으로 접속한다.

'사용자명#0000'의 형식으로 유저를 검색해 관계를 등록할 수 있다.
<hr>
<h4>2. 채팅방 목록</h4>
<img src="https://user-images.githubusercontent.com/97375357/227121303-e9c8c7ea-f857-4202-975e-1bcbfa7526ca.png" width="300"/>

디테일은 친구 목록과 같으나 마지막 대화 내역을 불러온다.

마지막 대화는 번역되지 않은 원문으로 출력된다.
<hr>
</details>

<details>
<summary><h3>채팅방 관련 설정</h3></summary>
<hr>
<h4>1. 채팅방 만들기</h4>
<img src="https://user-images.githubusercontent.com/97375357/227122305-d351e76e-bb53-450b-9324-89462e7a8134.png" width="400"/>
<hr>
<h4>2. 새 채팅방 개설</h4>
<img src="https://user-images.githubusercontent.com/97375357/227122311-b1c649e7-06c3-4d4c-ae0c-b4001ac728d5.png" width="400"/>

새 채팅방 개설 버튼을 누르면 채팅방 이름을 정할 수 있다.

정해진 채팅방 이름은 해당 채팅방에 소속된 모두에게 같은 이름으로 적용된다.
<hr>
<h4>3. 채팅방 초대</h4>
<img src="https://user-images.githubusercontent.com/97375357/227122315-ffe8ea0d-ff8e-4926-9ffa-fbc06c1967a3.png" width="400"/>

해당 채팅방의 입장 코드를 복사한 뒤,

<img src="https://user-images.githubusercontent.com/97375357/227122319-43e64f26-f564-4b08-bda1-fab11275a221.png" width="400"/>

채팅방 만들기 탭에서 입장 코드를 입력한 뒤 '참가하기' 버튼을 누르면 해당 채팅방에 입장할 수 있다.

<img src="https://user-images.githubusercontent.com/97375357/227122316-fd682bc5-0f8d-4cbb-b928-3c49a16f4cf3.png" width="250"/>
<hr>
<h4>4. 채팅방 나가기</h4>
<img src="https://user-images.githubusercontent.com/97375357/227122314-939de6de-9020-4244-b207-6d28b4426cda.png" width="400"/>

채팅방 상단의 나가기 버튼을 통해 언제든 채팅방에서 퇴장할 수 있다.
<hr>
</details>

<details>
<summary><h3>대화</h3></summary>
<hr>
<h4>1. 대화(한글)</h4>
<img src="https://user-images.githubusercontent.com/97375357/227125152-5b884b7e-b8f1-4363-8899-3180df222d66.png" width="300"/>
<hr>
<h4>2. 대화(일본어)</h4>
<img src="https://user-images.githubusercontent.com/97375357/227125151-b8140985-7aa1-4b36-a9fa-a50b5682a85e.png" width="300"/>
<hr>
</details>
