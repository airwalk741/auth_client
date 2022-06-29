<template>
  <div class="resister-container">
    <el-form
      ref="refresisterForm"
      class="resister-form"
      :model="resisterForm"
      :rules="rules"
      @keyup.enter="onSubmit"
      label-position="top"
    >
      <div class="title-container">
        <h3 class="title text-center">Resister</h3>
      </div>

      <!-- 이메일 -->
      <el-form-item prop="email" label="E-mail">
        <el-input
          placeholder="Input E-mail"
          v-model="resisterForm.email"
          @input="activeBtn"
        />
      </el-form-item>

      <!-- 패스워드 -->
      <el-form-item prop="password" label="password">
        <el-input
          name="password"
          type="password"
          placeholder="Input Password"
          v-model="resisterForm.password"
          @input="activeBtn"
        />
      </el-form-item>

      <!-- 패스워드 확인 -->
      <el-form-item prop="passwordConfirm" label="password confirmation">
        <el-input
          name="passwordConfirm"
          type="password"
          placeholder="Input Password Confirmation"
          v-model="resisterForm.passwordConfirm"
          @input="activeBtn"
        />
      </el-form-item>

      <!-- 닉네임 -->
      <el-form-item prop="name" label="nick-name">
        <el-input
          name="name"
          type="text"
          placeholder="Input Nick-Name"
          v-model="resisterForm.name"
          @input="activeBtn"
        />
      </el-form-item>

      <el-button
        @click="onSubmit"
        type="primary"
        class="resister-btn"
        size="default"
        :disabled="isBtn"
      >
        Submit
      </el-button>
      <p class="text-center text-muted">
        기존 가입한 이메일이 존재합니까?
        <span @click="goPage('Login')" class="text-primary fw-semibold btn-text"
          >로그인</span
        >
      </p>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

interface resisterForm {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();

    // 회원가입 폼
    const refresisterForm = ref<any>(null);
    const resisterForm = reactive<resisterForm>({
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
    });

    // 유효성 검사
    const validatePassword = (rule: any, value: string, callback: any) => {
      if (value === "") {
        callback(new Error("비밀번호는 필수 입력값입니다."));
      } else {
        if (resisterForm.password !== "") {
          if (!refresisterForm.value) return;
          refresisterForm.value.validateField("passwordConfirm", () => null);
        }
        callback();
      }
    };

    const validatePasswordConfirm = (
      rule: any,
      value: string,
      callback: any
    ) => {
      if (value === "") {
        callback(new Error("비밀번호 확인은 필수 입력값입니다."));
      } else if (value !== resisterForm.password) {
        callback(new Error("비밀번호와 맞지 않습니다."));
      } else {
        callback();
      }
    };

    const rules = reactive({
      email: [
        { required: true, message: "이메일을 입력해 주세요.", trigger: "blur" },
        {
          pattern:
            /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/,
          message: "이메일 형식이 아닙니다.",
          trigger: ["blur"],
        },
      ],
      password: [
        {
          required: true,
          message: "비밀번호를 입력해 주세요.",
          trigger: "blur",
        },
        {
          pattern: /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,16}$/,
          message:
            "영어, 숫자, 특수문자를 최소 하나씩 포함한 9~16자리 ( ! @ # $ % ^ * + = - )",
          trigger: ["change", "blur"],
        },
        { validator: validatePassword, trigger: ["change", "blur"] },
      ],
      passwordConfirm: [
        {
          required: true,
          message: "비밀번호 확인을 입력해 주세요.",
          trigger: "blur",
        },
        {
          pattern: /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,16}$/,
          message:
            "영어, 숫자, 특수문자를 최소 하나씩 포함한 9~16자리 ( ! @ # $ % ^ * + = - )",
          trigger: ["change", "blur"],
        },
        { validator: validatePasswordConfirm, trigger: ["change", "blur"] },
      ],
      name: [
        {
          required: true,
          message: "닉네임을 입력해 주세요.",
          trigger: ["change", "blur"],
        },
        {
          min: 5,
          message: "닉네임의 길이는 최소 5글자입니다.",
          trigger: ["change", "blur"],
        },
        {
          max: 15,
          message: "닉네임의 길이는 최대 15글자입니다.",
          trigger: ["change", "blur"],
        },
      ],
    });

    // 버튼 활성화
    const isBtn = ref<boolean>(true);
    function activeBtn(): void {
      const { email, password, passwordConfirm, name } = resisterForm;
      const emailRef =
        /^([\w\.\_\-])*[a-zA-Z0-9]+([\w\.\_\-])*([a-zA-Z0-9])+([\w\.\_\-])+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]{2,8}$/;

      const passwordRef =
        /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,16}$/;

      if (emailRef.test(email)) {
        if (passwordRef.test(password)) {
          if (password === passwordConfirm) {
            if (name.length > 4 && name.length < 16) {
              isBtn.value = false;
              return;
            }
          }
        }
      }
      isBtn.value = true;
    }

    // 로그인 요청
    async function onSubmit() {
      if (isBtn.value) return;
      console.log("회원가입 요청");

      try {
        const response: Promise<any> = await store.dispatch("requestJoin", {
          ...resisterForm,
        });

        // 이메일 인증으로 이동
      } catch (error: any) {
        console.log(error.response);
        const status = error.response.status;
        if (status === 400) {
          ElMessage({
            showClose: true,
            message: `이메일 형식을 확인해 주세요.`,
            type: "warning",
            grouping: true,
          });
        } else if (status === 409) {
          ElMessage({
            showClose: true,
            message: `이미 가입된 회원입니다.`,
            type: "warning",
            grouping: true,
          });
        } else {
          console.log("서버에러");
        }
      }
    }

    // 페이지 이동
    function goPage(data: string) {
      router.push({
        name: data,
      });
    }

    return {
      resisterForm,
      rules,
      onSubmit,
      activeBtn,
      isBtn,
      refresisterForm,
      goPage,
    };
  },
});
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;
.resister-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: $bg;
  align-items: center;
  .resister-form {
    width: 500px;
    background-color: $light_gray;
    padding: 40px;
    border-radius: 10px;
  }
  .title-container {
    .title {
      font-size: 25px;
      color: $bg;
      margin: 0px auto 25px auto;
      text-align: center;
      font-weight: bold;
    }
  }
}

.resister-btn {
  width: 100%;
  margin-bottom: 30px;
}

.btn-text {
  font-size: 14px;
  cursor: pointer;
  &:hover {
    color: crimson !important;
  }
}
</style>

<style lang="scss">
.resister-container {
  .el-input__wrapper {
    background-color: transparent;
    box-shadow: none;
    padding: 0px;
  }

  .el-input input {
    background: transparent;
    border: 0px;
    -webkit-appearance: none;
    border-radius: 0px;
    padding: 10px 5px 10px 15px;
    height: 42px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
  //hiden the input border
  .el-input__inner {
    box-shadow: none !important;
  }

  .el-button {
    height: 42px;
  }
}
</style>
