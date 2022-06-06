<template>
  <div>
    <div style="border: 1px solid #ccc; margin-top: 10px;">
      <!-- 工具栏 -->
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editor"
        :defaultConfig="toolbarConfig"
      />
      <!-- 编辑器 -->
      <Editor
        style="height: 78vh; overflow-y: hidden;"
        :defaultConfig="editorConfig"
        v-model="html"
        @onChange="onChange"
        @onCreated="onCreated"
      />
    </div>
    <a-button type="primary" style="float: right;margin-right: 10px;margin-top: 1%" @click="save">保存</a-button>
<!--    <div style="margin-top: 10px;">-->
<!--            <textarea-->
<!--              v-model="html"-->
<!--              readonly-->
<!--              style="width: 100%; height: 200px; outline: none;"-->
<!--            ></textarea>-->
<!--    </div>-->
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import {baseURL, getPointContentById, getRouteContentById, postPointContent, postRouteContent} from "~/plugins/axios";
const qiniu = require('qiniu-js')
export default {
  name: 'Content',
  components: { Editor, Toolbar },
  mounted() {
    this.id = this.$route.query.id
    this.type = this.$route.query.type
    if (this.type === 'route') {
      getRouteContentById(this.id).then(data => {
        console.log(data)
        this.html = data.content
      })
    } else if (this.type === 'point') {
      getPointContentById(this.id).then(data => {
        console.log(data)
        this.html = data.content
      })
    }
  },
  data() {
    return {
      id: '',
      type: '',
      editor: null,
      html: '',
      qiniu,
      toolbarConfig: {
      },
      editorConfig: {
        placeholder: '请输入内容',
        // autoFocus: false,
        // 所有的菜单配置，都要在 MENU_CONF 属性下
        MENU_CONF: {
          'uploadImage': {
            server: baseURL + '/file/wang/upload',
            // form-data fieldName ，默认值 'wangeditor-uploaded-image'
            fieldName: 'file',
            // 单个文件的最大体积限制，默认为 2M
            maxFileSize: 1024 * 1024 * 10, // 1M
            // 最多可上传几个文件，默认为 100
            maxNumberOfFiles: 10,
            // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
            allowedFileTypes: ['image/*'],
            // 将 meta 拼接到 url 参数中，默认 false
            metaWithUrl: false,
            // 跨域是否传递 cookie ，默认为 false
            withCredentials: true,
            timeout: 5 * 1000,
          },
          'uploadVideo': {
            server: baseURL + '/file/wang/upload',
            fieldName: 'file',
            maxFileSize: 1024 * 1024 * 100 * 10, // 100M
            maxNumberOfFiles: 10,
            allowedFileTypes: ['video/*', 'audio/*'],
            metaWithUrl: false,
            withCredentials: true,
            timeout: 20 * 1000,
          }
        }
      }
    }
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor)
    },
    onChange(editor) {
      // onChange 时获取编辑器最新内容
      // console.log('onChange', editor.getHtml())
    },
    insertTextHandler() {
      const editor = this.editor
      if (editor == null) return
      editor.insertText('hello')
    },
    save() {
      const editor = this.editor
      if (editor == null) return
      console.log(editor.getHtml())
      if (this.type === 'route') {
        postRouteContent({
          routeId: this.id,
          content: editor.getHtml()
        }).then(data => {
          this.$message.success("保存成功")
          this.$router.back()
        })
      } else if (this.type === 'point') {
        postPointContent({
          pointId: this.id,
          content: editor.getHtml()
        }).then(data => {
          this.$message.success("保存成功")
          this.$router.back()
        })
      }
    },
    disableHandler() {
      const editor = this.editor
      if (editor == null) return
      editor.disable()
    }
  },

  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁 editor ，重要！！！
  },
}
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>
