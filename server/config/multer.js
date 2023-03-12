const multer = require('multer');
const fs = require('fs');

try {
  fs.readdirSync('client/img/profiles');
} catch {
  console.error('client/img/profiles 폴더가 없습니다. 폴더를 생성합니다.');
  fs.mkdirSync('client/img/profiles');
}

const fileFilter = (req, file, cb) => {
  // 확장자 필터링
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true); // 해당 mimetype만 받겠다는 의미
  } else {
    // 다른 mimetype은 저장되지 않음
    req.fileValidationError = "jpg,jpeg,png 파일만 업로드 가능합니다.";
    cb(null, false);
  }
};

const upload = multer({
  storage: multer.diskStorage({
    //폴더위치 지정
    destination: (req, file, done) => {
      done(null, "client/img/profiles/");
    }
    // filename: (req, file, done) => {
    //   done(null, Date.now() + file.originalname);
    // },
  }),
  fileFilter : fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});

module.exports = { upload };