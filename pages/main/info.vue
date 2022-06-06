<template>
  <div>
    <a-descriptions title="用户信息" bordered>
      <a-descriptions-item label="身份证号">
        {{ userInfo.idNumber }}
      </a-descriptions-item>
      <a-descriptions-item label="用户角色" :span="2">
        {{userInfo.displayRole}}
      </a-descriptions-item>
      <a-descriptions-item label="上次登录">
        {{userInfo.loginTime}}
      </a-descriptions-item>
      <a-descriptions-item label="注册时间" :span="2">
        {{userInfo.createdTime}}
      </a-descriptions-item>
      <a-descriptions-item label="姓名">
        {{userInfo.realName}}
      </a-descriptions-item>
      <a-descriptions-item label="学号" :span="2">
        {{userInfo.studentNumber}}
      </a-descriptions-item>
      <a-descriptions-item label="住址">
        <a-input v-model="updateForm.address"></a-input>
      </a-descriptions-item>
      <a-descriptions-item label="宿舍" :span="2">
        <a-input v-model="updateForm.dorm"></a-input>
      </a-descriptions-item>
      <a-descriptions-item label="密码">
        <a-input v-model="updateForm.password"></a-input>
      </a-descriptions-item>
      <a-descriptions-item label="操作" :span="2">
        <a-button @click="updateUserInfo" :disabled="updateForm.disabled">
          <a-icon type="edit" />
          提交</a-button>
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script>

import {updateUser} from "~/plugins/axios";

export default {
  name: "info",
  mounted() {
    this.updateForm.dorm  = this.userInfo.dorm
    this.updateForm.address  = this.userInfo.address
    this.updateForm.idNumber  = this.userInfo.idNumber
  },
  computed: {
    userInfo() {
      return this.$store.state.userstore.userInfo
    }
  },
  data() {
    return {
      updateForm: {
        dorm: '',
        address: '',
        disabled: false
      }
    }
  },
  methods: {
    updateUserInfo() {
      this.updateForm.disabled = true
      updateUser(this.updateForm).then(res => {
        if (res.code === 2000) {
          this.updateForm.disabled = false

          this.$message.success(res.data)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
