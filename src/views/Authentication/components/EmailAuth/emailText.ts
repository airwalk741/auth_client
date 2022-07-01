function sendEmailText(mailType: string, projectName: string): string {
  return `
  <div
    style="
      width: 550px;
      height: 450px;
      border-top: 4px solid #02b875;
      font-family: 'Apple SD Gothic Neo', 'sans-serif' !important;
      box-sizing: border-box;
      border-bottom: 1px solid #ddd;
      padding: 20px 40px 20px 40px;
      margin: auto;
    "
  >
    <h1 style="text-align: center; margin-bottom: 50px">${projectName}</h1>
    <h3 style="margin-bottom: 20px; font-size: 15px">
      메일 인증 안내입니다.
    </h3>
    <div>
      <p style="font-size: 15px; margin-bottom: 8px">안녕하세요.</p>
      <p style="font-size: 15px; margin-bottom: 8px">
      ${
        mailType === "join"
          ? ` ${projectName}에 가입해 주셔서 진심으로 감사드립니다.`
          : ""
      }
      </p>
      <p style="font-size: 15px; margin-bottom: 8px">        
        아래 인증번호를 입력하시고 ${
          mailType === "join"
            ? "회원가입을 완료해 주세요."
            : "비밀번호 찾기를 완료해 주세요."
        }
      </p>
      <p style="font-size: 15px; margin-bottom: 8px">감사합니다.</p>
    </div>
    <p
      style="
        width: 210px;
        height: 45px;
        background-color: #02b875;
        margin: 70px auto 0px auto;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 18px;
        font-weight: bolder;
      "
    >
      <span>$code</span>
    </p>
  </div>

`;
}

export { sendEmailText };
