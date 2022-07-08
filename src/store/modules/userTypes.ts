interface Login {
  email: string;
  password: string;
}

interface LogoutWithAccountRequest {
  email: string;
  password: string;
  login_key: string;
}

interface Join {
  email: string;
  password: string;
  name: string;
  phone_number: string;
}

interface SendCodeRequest {
  email: string;
  from: string;
  subject: string;
  contentType: string;
  charset: string;
  body: string;
}

interface VerifyJoin {
  email: string;
  code: string;
}

interface PasswordRequest {
  email: string;
  code: string;
  password: string;
}

interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export {
  Login,
  LogoutWithAccountRequest,
  Join,
  SendCodeRequest,
  VerifyJoin,
  PasswordRequest,
  VerifyResetCodeRequest,
};
