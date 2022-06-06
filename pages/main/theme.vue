<template>
  <div>
    <a-modal width="60vw" v-model="visible" title="关联路线" ok-text="关闭" cancel-text="取消"
             @ok="modalSave" @cancel="modalSave"
             style="position: fixed;z-index: 10000;">
      <a-table :columns="themeRoutes" :data-source="data" bordered>
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
      <a-tab-pane key="theme" tab="主题列表">
        <a-table :columns="columns" :data-source="data" bordered>
          <template
            v-for="col in ['']"
            :slot="col"
            slot-scope="text, record, index">
            <div :key="col">
            </div>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <a-button type="primary" size="small" @click="updateItem(record)">修改</a-button>
            <a-button size="small" @click="showThemeRoutes(record)">路线</a-button>
            <a-popconfirm title="删除会将已关联路线的主题同步删除,是否继续?" @confirm="delTheme(record)">
              <a-button type="danger" size="small">删除</a-button>
            </a-popconfirm>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="form" tab="主题管理" force-render>
        <a-form :form="formData" :label-col="{ span: 2,}" :wrapper-col="{ span: 20 }">
          <a-form-item label="主题名称">
            <a-input v-model="formData.themeName"></a-input>
          </a-form-item>
          <a-form-item label="主题描述">
            <a-input v-model="formData.themeDesc"></a-input>
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
  getRouteById, delRoutePoint, listTheme, postTheme, updateTheme, listThemeRoutes, delThemeById
} from "~/plugins/axios";

const columns = [
  {
    title: '主题编号',
    dataIndex: 'themeId',
    width: '10%',
    scopedSlots: {customRender: 'themeId'},
  },
  {
    title: '主题名称',
    dataIndex: 'themeName',
    width: '15%',
    scopedSlots: {customRender: 'themeName'},
  },
  {
    title: '主题描述',
    dataIndex: 'themeDesc',
    width: '10%',
    scopedSlots: {customRender: 'themeDesc'},
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    width: '15%',
    scopedSlots: {customRender: 'createdTime'},
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '15%',
    scopedSlots: {customRender: 'operation'},
  }
];


const themeRoutes = [
  {
    title: '路线编号',
    dataIndex: 'routeId',
    width: '25%',
    scopedSlots: {customRender: 'routeId'},
  },
  {
    title: '路线名称',
    dataIndex: 'routeName',
    scopedSlots: {customRender: 'routeName'},
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    width: '25%',
    scopedSlots: {customRender: 'createdTime'},
  },
];
const data = []
export default {
  name: 'theme',
  mounted() {
    listTheme().then(data => {
      this.data = data
    })
  },
  data() {
    return {
      data,
      activeKey: 'theme',
      columns,
      themeRoutes,
      visible: false,
      formData: {
        update: false,
      },
    };
  },
  methods: {
    showThemeRoutes(record) {
      listThemeRoutes(record.themeId).then(data => {
        this.data = data
        this.visible = true
      })
    },
    delTheme(record) {
      delThemeById(record.themeId).then(data => {
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
        await postTheme(this.formData).then(data => {
          this.$message.success("添加成功")
        })
      }
      listTheme().then(data => {
        this.data = data
        this.activeKey = 'theme'
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
