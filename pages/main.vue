<template>
  <div id="components-layout-demo-basic">
    <a-layout>
      <a-layout-sider>
        <a-menu
          style="width: 200px;height: 100vh;position: fixed;z-index: 1;left: 0;top: 0"
          :default-selected-keys="['1']"
          :open-keys.sync="openKeys"
          mode="inline"
          @click="handleClick"
        >
          <a-menu-item key="info">
            <a-icon type="mail"/>
            个人信息
          </a-menu-item>
          <a-menu-item key="route">
            <a-icon type="gateway"/>
            路线管理
          </a-menu-item>
          <a-menu-item key="user">
            <a-icon type="user"/>
            用户管理
          </a-menu-item>
          <a-sub-menu key="auth">
            <span slot="title"><a-icon type="lock"/><span style="margin-left: 3px">权限管理</span></span>
            <a-menu-item key="role">
              角色
            </a-menu-item>
            <a-menu-item key="permission">
              权限
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item key="theme">
            <a-icon type="inbox"/>
            主题管理
          </a-menu-item>
          <a-menu-item key="file">
            <a-icon type="file"/>
            文件管理
          </a-menu-item>
          <a-menu-item key="logout">
            <a-icon type="unlock"/>
            退出登录
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-content style="background-color: white">
          <nuxt-child/>
        </a-layout-content>
        <a-layout-footer style="background-color: white">
          &copy; 2022
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>

import {logout} from "~/plugins/axios";

export default {
  name: "index",
  computed: {
    userInfo() {
      return this.$store.state.userstore.userInfo
    }
  },
  data() {
    return {
      current: ['mail'],
      openKeys: ['info'],
    };
  },
  methods: {
    handleClick(e) {
      if (e.key === 'logout') {
        logout()
        this.$router.push({
          path: `/user/login`
        })
      } else {
        this.$router.push({
          path: `/main/${e.key}`
        })
      }

    },
    titleClick(e) {
      this.$router.push({
        path: `/main/${e.key}`
      })
    },
  },
}
</script>

<style scoped>
#components-layout-demo-basic {
  text-align: left;
  height: 100%;
}

#components-layout-demo-basic .ant-layout-header,
#components-layout-demo-basic .ant-layout-footer {
  text-align: center;
}

#components-layout-demo-basic .ant-layout-footer {
  line-height: 1.5;
}

#components-layout-demo-basic .ant-layout-sider {
  line-height: 120px;
}

#components-layout-demo-basic .ant-layout-content {
  min-height: 120px;
  line-height: 120px;
}

#components-layout-demo-basic > .ant-layout {
  margin-bottom: 48px;
}

#components-layout-demo-basic > .ant-layout:last-child {
  margin: 0;
}
</style>
