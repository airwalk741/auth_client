import { createStore } from "vuex";
import axios from "axios";

interface User {
  isLogin: boolean;
}

export default createStore<User>({
  state: {
    isLogin: false,
  },
  mutations: {
    setIsLogin: function (state, data: boolean) {
      state.isLogin = data;
    },
  },
  actions: {
    // 로그인
    requestLogin: function (payload, data) {
      const url = "/api/auth/v1/login";
      return axios.post(url, data);
    },
    // 중복 로그인 삭제
    requestRemoveToken: function (payload, data) {
      const url = `/api/auth/v1/logout-with-account`;
      return axios.delete(url, { data });
    },
    // 레디 회원가입
    requestJoin: function (payload, data) {
      const url = "/api/auth/v1/user";
      return axios.post(url, data);
    },
  },
  modules: {},
});
