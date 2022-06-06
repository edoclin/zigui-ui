<template>
  <div class="bg">
    <div style="margin: 15% 35%">
      <a-card title="秭归研学基地后台管理系统" style="width: 100%;" :head-style="{'text-align': 'center'}">
        <a-form :form="form" @submit="handleSubmit">
          <a-form-item :validate-status="usernameError() ? 'error' : ''" :help="usernameError() || ''">
            <a-input v-decorator="['username', { rules: [{ required: true, message: '请输入身份证号' }] },]" placeholder="请输入身份证号">
              <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)"/>
            </a-input>
          </a-form-item>
          <a-form-item :validate-status="passwordError() ? 'error' : ''" :help="passwordError() || ''">
            <a-input
              v-decorator="['password',{ rules: [{ required: true, message: '请输入密码' }] },]"
              type="password"
              placeholder="密码"
            >
              <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)"/>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button style="width: 100%" type="primary" html-type="submit"
                      :disabled="hasErrors(form.getFieldsError())">
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script>
import {login} from "~/plugins/axios";

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

export default {
  name: "login",
  data() {
    return {
      visible: false,
      hasErrors,
      form: this.$form.createForm(this, {name: 'horizontal_login'}),
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.form.validateFields();
    });
  },
  methods: {
    usernameError() {
      const {getFieldError, isFieldTouched} = this.form;
      return isFieldTouched('username') && getFieldError('username');
    },
    passwordError() {
      const {getFieldError, isFieldTouched} = this.form;
      return isFieldTouched('password') && getFieldError('password');
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          login(values).then(data => {
            this.$store.commit('userstore/setUserInfo', data)
            this.$router.push({path: `/main/info`})
          })
        }
      });
    },
  },
}
</script>
<style scoped>
.bg {
  background: url(static/bg.png);
  filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale')";
  -moz-background-size: 100% 100%;
  border: transparent dotted 1px;
  background-size: cover;
  width: inherit;
  height: 100vh;
  overflow-scrolling: touch;
}
</style>
