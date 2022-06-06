<template>
  <div>
    <a-modal width="60vw" v-model="visible" title="角色权限" ok-text="关闭" cancel-text="取消"
             @ok="modalSave" @cancel="modalSave"
             style="position: fixed;z-index: 10000;">
      <a-table :columns="columns" :data-source="data" bordered>
        <template
          v-for="col in ['']"
          :slot="col"
          slot-scope="text, record, index">
          <div :key="col">
          </div>
        </template>
      </a-table>
    </a-modal>
    <a-tabs :activeKey="activeKey" @tabClick="tabChange">
      <a-tab-pane key="role" tab="角色列表">
        <a-table :columns="columns" :data-source="data" bordered>
          <template
            v-for="col in ['permissions']"
            :slot="col"
            slot-scope="text, record, index">
            <div :key="col">
              <a-button type="link" @click="showModal(record)">查看权限</a-button>
            </div>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <a-button type="primary" size="small" @click="updateItem(record)">修改</a-button>
            <a-popconfirm title="删除会将已关联用户的角色同步删除,是否继续?" @confirm="delRole(record)">
              <a-button type="danger" size="small">删除</a-button>
            </a-popconfirm>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="form" tab="角色管理" force-render>
        <a-form :form="formData" :label-col="{ span: 2,}" :wrapper-col="{ span: 20 }">
          <a-form-item label="角色名称">
            <a-input v-model="formData.roleName"></a-input>
          </a-form-item>
          <a-form-item label="角色描述">
            <a-input v-model="formData.roleDesc"></a-input>
          </a-form-item>
          <a-form-item label="授权路线">
            <a-select
              v-if="permissionList !== null"
              @select="selectPermission"
              @deselect="deselectPermission"
              mode="multiple"
              placeholder="请添加权限"
              style="width: 100%">
              <a-select-option v-for="(item, index) in permissionList" :key="index">
                {{ item.routeName }}
              </a-select-option>
            </a-select>
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
  listPermission, delRoleById
} from "~/plugins/axios";

const columns = [
  {
    title: '角色编号',
    dataIndex: 'roleId',
    width: 100,
    scopedSlots: {customRender: 'roleId'},
  },
  {
    title: '角色名称',
    dataIndex: 'roleName',
    width: 200,
    scopedSlots: {customRender: 'roleName'},
  },
  {
    title: '角色描述',
    dataIndex: 'roleDesc',
    width: 200,
    ellipsis: true,
    scopedSlots: {customRender: 'roleDesc'},
  },
  {
    title: '权限列表',
    dataIndex: 'permissions',
    width: 80,
    scopedSlots: {customRender: 'permissions'},
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    width: 140,
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
  name: 'role',
  mounted() {
    listRole().then(data => {
      this.data = data
    })
    listPermission().then(data => {
      this.permissionList = data
    })
  },
  data() {
    return {
      data,
      activeKey: 'role',
      columns,
      visible: false,
      formData: {
        update: false,
        permissionIds: []
      },
      permissionList: []
    };
  },
  methods: {
    showModal(record) {
      console.log(record)
    },
    deselectPermission(value, option) {
      this.formData.permissionIds.splice(this.formData.permissionIds.findIndex(item => item === this.permissionList[value].permissionId), 1)

    },
    selectPermission(value, option) {
      this.formData.permissionIds.push(this.permissionList[value].permissionId)
    },
    showThemeRoutes(record) {
      listThemeRoutes(record.themeId).then(data => {
        this.data = data
        this.visible = true
      })
    },
    delRole(record) {
      delRoleById(record.roleId).then(data => {
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
        await updateTheme(this.formData).then(data => {
          this.$message.success("更新成功")
        })
      } else {
        await postRole(this.formData).then(data => {
          this.$message.success("添加成功")
        })
      }
      listRole().then(data => {
        this.data = data
        this.activeKey = 'role'
        this.formData = {
          update: false
        }
      })
    },
    modalSave() {
      listTheme().then(data => {
        this.data = data
        this.visible = false
      })

    },
    changeMode(event) {
    },
    clickPoint(event) {
      console.log(event)
      this.pointIds.forEach(item => {
        if (item.data[0] === event.target._position[0] && item.data[1] === event.target._position[1]) {
          if (this.formData.points.length !== 0) {
            let index = this.formData.points.findIndex(point => {
              return point.pointId === item.pointId
            })
            if (index !== -1) {
              this.pointFormData = this.formData.points[index]
            }
          }
          this.pointFormData.pointId = item.pointId
          this.visible = true
        }
      })
    },
    onDraw(type, obj) {
      switch (type) {
        case "marker":
          postPoint({
            routeId: this.formData.routeId,
            point: obj
          }).then(data => {
            this.points.push(obj)
            this.pointIds.push({
              'pointId': data,
              'data': obj
            })
          })
          break;
        case "polyline":
          this.polyline = []
          obj.forEach(item => {
            this.polyline.push(item)
          })
          postPolyline({
            routeId: this.formData.routeId,
            polyline: this.polyline
          }).then(data => {

          })
          break;
      }
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
      if (tabKey === 'route') {
        delEmptyRoute(this.formData.routeId, false).then(data => {
          this.formData = {
            update: false
          }
        })
      }
    },
    uploadStatusChange(event) {
      if (event.file.status === 'done') {
        if (this.uploadType === 'route') {
          this.formData.fileIds.push(event.file.response.data)
        } else {
          this.pointFormData.fileIds.push(event.file.response.data)
        }
      }
    }
  },
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
