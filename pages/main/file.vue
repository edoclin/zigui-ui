<template>
  <div>
    <a-tabs :activeKey="activeKey">
      <a-tab-pane key="file" tab="文件列表">
        <a-table :columns="columns" :data-source="data" bordered :scroll="{ x: 1000, y: 'max-content' }">
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
            v-for="col in ['accessUrl']"
            :slot="col"
            slot-scope="text, record, index">
            <div :key="col">
              <a-button type="link" @click="toFile(record)">点击访问</a-button>
            </div>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <a-popconfirm title="确定删除?" @confirm="delItem(record)">
              <a-button type="danger" size="small">删除</a-button>
            </a-popconfirm>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>

</template>
<script>var searchInput;


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
  postUser, listFile, delFileById
} from "~/plugins/axios";

const columns = [
  {
    title: '文件编号',
    dataIndex: 'fileId',
    width: 180,
    scopedSlots: {customRender: 'fileId'},
  },
  {
    title: '文件名',
    dataIndex: 'originalName',
    ellipsis: true,
    width: 300,
    scopedSlots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
      customRender: 'customRender',
    },
    onFilter: (value, record) => record.originalName.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => {
          this.searchInput.focus();
        });
      }
    }
  },
  {
    title: '访问路径',
    dataIndex: 'accessUrl',
    width: 100,
    scopedSlots: {customRender: 'accessUrl'},
  },
  {
    title: '上传时间',
    dataIndex: 'createdTime',
    width: 180,
    scopedSlots: {customRender: 'createdTime'},
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 100,
    scopedSlots: {customRender: 'operation'},
  }
];
const data = []
export default {
  name: 'file',
  mounted() {
    listFile().then(data => {
      this.data = data
    })
  },
  data() {
    return {
      data,
      activeKey: 'file',
      columns,
      searchText: '',
      searchInput: null,
      searchedColumn: '',
    }
  },
  methods: {
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
    },
    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },
    toFile(record) {
      let aux = document.createElement("input");
      aux.setAttribute("value", record.accessUrl);
      document.body.appendChild(aux);
      aux.select();
      document.execCommand("copy");
      document.body.removeChild(aux);
      this.$message.success("链接已复制到剪切板")
      setTimeout(() => {
        window.open(record.accessUrl, "_black")
      }, 2000)
    },
    delItem(record) {
      delFileById(record.fileId).then(data => {
        this.$message.success("删除成功")
        this.data.splice(this.data.findIndex(item => item === record), 1)
      })
    }
  },
};
</script>
<style scoped>
.editable-row-operations a {
  margin-right: 8px;
}
</style>
