<template>
  <div>
    <a-tabs :activeKey="activeKey" @tabClick="tabChange">
      <a-tab-pane key="user" tab="用户列表">
        <a-table :columns="columns" :data-source="data" bordered :scroll="{ x: 1800, y: 'max-content' }">
          <div
            slot="filterDropdown"
            slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
            style="padding: 8px"
          >
            <a-input
              v-ant-ref="c => (searchInput = c)"
              placeholder="输入文件名搜索"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block;"
              @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
              type="primary"
              icon="search"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              搜索
            </a-button>
            <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
              重置
            </a-button>
          </div>
          <template
            v-for="col in ['displayRole', 'routeRole', 'address']"
            :slot="col"
            slot-scope="text, record, index">
            <div :key="col" v-if="col === 'displayRole'">
              <a-select
                @select="selectRole($event, $event, record)"
                :defaultValue="record.displayRole"
                style="width: 100%">
                <a-select-option v-for="(item, index) in options" :key="index">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </div>
            <div :key="col" v-else-if="col === 'routeRole'">
              <a-select
                :defaultValue="record.roles"
                v-if="roleList !== null"
                @select="selectRouteRole($event, $event, record)"
                @deselect="deselectRole($event, $event, record)"
                mode="multiple"
                placeholder="请添加角色"
                style="width: 100%">
                <a-select-option v-for="(item, index) in roleList" :key="index">
                  {{ item.roleName }}
                </a-select-option>
              </a-select>
            </div>
            <div v-else>
              {{ `${record.country},${record.province}, ${record.city}` }}
            </div>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <a-button type="primary" size="small" @click="updateItem(record)">修改</a-button>
            <a-popconfirm title="确定删除?" @confirm="delTheme(record)" v-if="record.role !== 'ADMIN'">
              <a-button type="danger" size="small">删除</a-button>
            </a-popconfirm>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="form" tab="用户管理" force-render :disabled="!formData.update">
        <a-form :form="formData" :label-col="{ span: 2,}" :wrapper-col="{ span: 20 }">
          <a-form-item label="用户编号" v-if="this.formData.update">
            <a-input v-model="formData.userId" disabled></a-input>
          </a-form-item>
          <a-form-item label="联系方式">
            <a-input v-model="formData.mobile"></a-input>
          </a-form-item>
          <a-form-item label="账户">
            <a-input v-model="formData.username" :disabled="formData.update"></a-input>
          </a-form-item>
          <a-form-item label="工号">
            <a-input v-model="formData.workNumber"></a-input>
          </a-form-item>
          <a-form-item label="姓名">
            <a-input v-model="formData.name"></a-input>
          </a-form-item>
          <a-form-item label="职位">
            <a-input v-model="formData.post"></a-input>
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
  listUser,
  changeRoleByUserId,
  postUser, listRole, addUserRole, delRoleById, delUserRole
} from "~/plugins/axios";
import number from "ant-design-vue/lib/statistic/Number";

const columns = [
  {
    title: '用户编号',
    dataIndex: 'userId',
    width: 250,
    scopedSlots: {customRender: 'userId'},
  },
  {
    title: 'openid',
    dataIndex: 'openId',
    width: 300,
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRender',
    },
    onFilter: (value, record) => record.openId.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus();
        });
      }
    }
  },
  {
    title: '微信昵称',
    dataIndex: 'nickName',
    width: 200,
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRender',
    },
    onFilter: (value, record) => record.nickName.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus();
        });
      }
    }
  },
  {
    title: '地址',
    dataIndex: 'address',
    width: 200,
    scopedSlots: {customRender: 'address'},
  },
  {
    title: '账户',
    dataIndex: 'username',
    width: 250,
    scopedSlots: {customRender: 'username'},
  },
  {
    title: '系统权限',
    dataIndex: 'displayRole',
    width: 200,
    scopedSlots: {customRender: 'displayRole'},
  },
  {
    title: '路线权限',
    dataIndex: 'routeRole',
    width: 200,
    scopedSlots: {customRender: 'routeRole'},
  },
  {
    title: '工号',
    dataIndex: 'workNumber',
    width: 200,
    scopedSlots: {customRender: 'workNumber'},
  },
  {
    title: '姓名',
    dataIndex: 'name',
    width: 150,
    scopedSlots: {customRender: 'name'},
  },
  {
    title: '联系方式',
    dataIndex: 'mobile',
    width: 150,
    scopedSlots: {customRender: 'mobile'},
  },
  {
    title: '职位',
    dataIndex: 'post',
    width: 150,
    scopedSlots: {customRender: 'post'},
  },
  {
    title: '上次登录时间',
    dataIndex: 'lastLogin',
    width: 230,
    scopedSlots: {customRender: 'lastLogin'},
  },
  {
    title: '注册时间',
    dataIndex: 'createdTime',
    width: 170,
    scopedSlots: {customRender: 'createdTime'},
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 150,
    scopedSlots: {customRender: 'operation'},
  }
];
const data = []
export default {
  name: 'user',
  mounted() {
    listUser().then(data => {
      this.data = data
    })
    listRole().then(data => {
      this.roleList = data
    })
  },
  data() {
    return {
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      data,
      activeKey: 'user',
      columns,
      visible: false,
      formData: {
        update: false,
      },
      roleList: [],
      options: [
        {
          label: '管理员',
          value: 'ADMIN'
        },
        {
          label: '普通用户',
          value: 'USER'
        }
      ],
    };
  },
  methods: {
    deselectRole(value, option, record) {
      if (value !== +value) {
        value = this.roleList.find(item => item.roleName === value).roleId
      }
      delUserRole(record.userId, value).then(data => {
      })


    },
    selectRouteRole(value, option, record) {
      addUserRole(record.userId, this.roleList[value].roleId).then(data => {
      })
    },
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },
    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },
    selectRole(value, option, record) {
      changeRoleByUserId(record.userId, this.options[value].value).then(data => {
        this.$message.success("修改角色成功")
      })
    },
    showThemeRoutes(record) {
      listThemeRoutes(record.themeId).then(data => {
        this.data = data
        this.visible = true
      })
    },
    delTheme(record) {
      console.log(record)
    },
    updateItem(record) {
      this.formData = record
      this.formData.update = true
      this.activeKey = 'form'
    },
    async submitForm() {
      if (this.formData.update) {
        await postUser(this.formData).then(data => {
          this.$message.success("添加成功")
        })
      }
      listUser().then(data => {
        this.data = data
        this.activeKey = 'user'
        this.formData = {
          update: false
        }
      })
    },
    tabChange(tabKey) {
      this.activeKey = tabKey
      if (tabKey === 'form') {
      }
      if (tabKey === 'user') {
        this.formData = {
          update: false
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
