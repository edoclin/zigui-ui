<template>
  <div>
    <a-modal width="60vw" v-model="visible" title="关联路线" ok-text="关闭" cancel-text="取消"
             @ok="modalSave" @cancel="modalSave"
             style="position: fixed;z-index: 10000;">
    </a-modal>
    <a-tabs :activeKey="activeKey" @tabClick="tabChange">
      <a-tab-pane key="permission" tab="权限列表" >
        <a-table :columns="columns" :data-source="data" bordered :scroll="{ x: 1800, y: 'max-content' }">
          <template
            v-for="col in ['']"
            :slot="col"
            slot-scope="text, record, index">
            <div :key="col">
            </div>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <a-button type="primary" size="small" @click="updateItem(record)">修改</a-button>
            <a-popconfirm title="删除会将已关联角色的权限同步删除,是否继续?" @confirm="delTheme(record)">
              <a-button type="danger" size="small">删除</a-button>
            </a-popconfirm>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="form" tab="权限管理">
        <a-form :form="formData" :label-col="{ span: 2,}" :wrapper-col="{ span: 20 }">
          <a-form-item label="关联路线" v-if="!formData.update">
            <a-select
              @change="handleSelectChange"
              v-if="routeList !== null"
              placeholder="请选择关联路线"
              style="width: 100%">
              <a-select-option  v-for="(item, index) in routeList"  :key="index">
                {{ item.routeName }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="权限名称">
            <a-input v-model="formData.permissionName" disabled=""></a-input>
          </a-form-item>
          <a-form-item label="权限描述">
            <a-input v-model="formData.permissionDesc"></a-input>
          </a-form-item>
          <a-form-item label="操作">
            <a-button type="primary" style="width: 100%;" @click="submitForm">提交</a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </div>

</template>
<script>

import {
  generateRouteId,
  postPoint,
  postPolyline,
  baseURL,
  postRoute,
  listRoute,
  delEmptyRoute,
  getRouteById,
  delRoutePoint,
  listTheme,
  postTheme,
  updateTheme,
  listThemeRoutes,
  delThemeById,
  listRole,
  postRole,
  listRouteName, postPermission, listPermission, updatePermission, delPermissionById
} from "~/plugins/axios";

const columns = [
  {
    title: '权限编号',
    dataIndex: 'permissionId',
    width: 250,
    scopedSlots: {customRender: 'permissionId'},
  },
  {
    title: '权限名称',
    dataIndex: 'permissionName',
    width: 300,
    ellipsis: true,
    scopedSlots: {customRender: 'permissionName'},
  },
  {
    title: '权限描述',
    dataIndex: 'permissionDesc',
    width: 300,
    scopedSlots: {customRender: 'permissionDesc'},
  },
  {
    title: '关联路线',
    dataIndex: 'routeName',
    width: 300,
    scopedSlots: {customRender: 'routeName'},
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    width: 150,
    scopedSlots: {customRender: 'createdTime'},
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 120,
    scopedSlots: {customRender: 'operation'},
  }
];

const data = []
export default {
  name: 'permission',
  mounted() {
    listPermission().then(data => {
      this.data = data
    })
    listRouteName().then(data => {
      this.routeList = data
    })
  },
  data() {
    return {
      data,
      activeKey: 'permission',
      columns,
      visible: false,
      formData: {
        update: false,
        routeId: '',
        permissionName: '查看路线',
      },
      routeList: []
    };
  },
  methods: {

    handleSelectChange(index) {
      this.formData.routeId = this.routeList[index].routeId
    },
    showThemeRoutes(record) {
      listThemeRoutes(record.themeId).then(data => {
        this.data = data
        this.visible = true
      })
    },
    delTheme(record) {
      delPermissionById(record.permissionId).then(data => {
        this.data.splice(this.data.findIndex(item => item === record), 1)
        this.$message.success("删除成功")
      })
    },
    updateItem(record) {
      this.formData = record
      this.formData.update = true
      this.activeKey = 'form'
    },
    async submitForm() {
      if (this.formData.update) {
        delete this.formData.createdTime
        await updatePermission(this.formData).then(data => {
          this.$message.success("更新成功")
        })
      } else {
        await postPermission(this.formData).then(data => {
          this.$message.success("添加成功")
        })
      }
      listPermission().then(data => {
        this.data = data
        this.activeKey = 'permission'
        this.formData = {
          update: false,
          permissionName: '查看路线',
        }
      })
    },
    modalSave() {
      listTheme().then(data => {
        this.data = data
        this.visible = false
      })

    },
    tabChange(tabKey) {
      this.activeKey = tabKey
      if (tabKey === 'form') {
        if (!this.formData.update) {
          generateRouteId().then(data => {
            this.formData.routeId = data
          })
        }
      }
    },
  },
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
