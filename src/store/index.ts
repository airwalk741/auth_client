import { createStore } from "vuex";
import axios from "axios";
import {
  Login,
  LogoutWithAccountRequest,
  Join,
  SendCodeRequest,
  VerifyJoin,
  PasswordRequest,
  VerifyResetCodeRequest,
} from "./modules/userTypes";

interface User {
  isLogin: boolean;
}

export default createStore<User>({
  state: {
    isLogin: false,
  },
  mutations: {
    SET_ISLOGIN: function (state, data: boolean) {
      state.isLogin = data;
    },
  },
  actions: {
    // 로그인
    requestLogin: function (payload, data: Login) {
      const url = "/api/auth/v1/login";
      return axios.post(url, data);
    },
    // 중복 로그인 삭제
    requestLogoutWithAccountRequest: function (
      payload,
      data: LogoutWithAccountRequest
    ) {
      const url = `/api/auth/v1/logout-with-account`;
      return axios.delete(url, { data });
    },
    // 레디 회원가입
    requestJoin: function (payload, data: Join) {
      const url = "/api/auth/v1/user";
      return axios.post(url, data);
    },
    // 인증 메일 보내기
    requestSendJoinCode: function (payload, data: SendCodeRequest) {
      const url = "/api/auth/v1/join/code";
      return axios.post(url, data);
    },
    // 인증 코드 인증
    requestVerifyJoin: function (payload, data: VerifyJoin) {
      const url = "/api/auth/v1/join/verification";
      return axios.post(url, data);
    },
    requestSendResetCode: function (payload, data: SendCodeRequest) {
      const url = "/api/auth/v1/reset/code";
      return axios.post(url, data);
    },
    requestVerifyResetCode: function (payload, data: VerifyResetCodeRequest) {
      const url = "/api/auth/v1/reset/code/verification";
      return axios.post(url, data);
    },
  },
  modules: {},
});
