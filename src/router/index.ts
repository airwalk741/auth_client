import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import LoginVue from "@/views/Authentication/Login/index.vue";
import ResisterVue from "@/views/Authentication/Resister/index.vue";
import PasswordChange from "@/views/Authentication/Password/index.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginVue,
  },
  {
    path: "/resister",
    name: "Resister",
    component: ResisterVue,
  },
  {
    path: "/password",
    name: "PasswordChange",
    component: PasswordChange,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
