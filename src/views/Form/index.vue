<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-10-28 20:35:05
 * @LastEditors: solid
 * @LastEditTime: 2022-12-02 14:17:37
-->
<template>
  <div style="padding: 20px">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-input v-model="BaseURL" placeholder="请输入请求URL">
          <el-button
            slot="append"
            icon="el-icon-position"
            @click="SendRequest"
          ></el-button>
        </el-input>
      </div>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div>请求头</div>
            <div>
              <el-button
                slot="append"
                icon="el-icon-plus"
                @click="headers.push({ key: '', value: '' })"
              ></el-button>
            </div>
          </div>
        </div>
        <div v-for="(item, index) in headers" :key="index" class="text item">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <el-input
              v-model="item.key"
              placeholder="请输入headers的key"
              style="margin: 10px 20px"
            />
            <el-input
              v-model="item.value"
              placeholder="请输入headers的value"
              style="margin-right: 10px"
            />
            <el-button
              type="text"
              icon="el-icon-close"
              circle
              @click="headers.splice(index, 1)"
            ></el-button>
          </div>
        </div>
      </el-card>
      <el-card style="margin: 20px 0" v-if="resData">
        <div slot="header" class="clearfix">
          <el-input v-model="DataPath" placeholder="请输入列表的字段位置">
            <el-button slot="append" @click="toGetColumnName"
              >获取列名</el-button
            >
          </el-input>
        </div>
        <div style="display: flex; justify-content: space-between">
          <div style="width: 48%">
            <ElCollapse v-model="activeName" accordion>
              <ElCollapseItem
                :title="item.title"
                :name="item.title"
                v-for="(item, index) in cols"
                :key="item.title"
                :index="index"
                @dragstart="startDrag"
                @drop="onDrop"
              >
                <div>
                  <el-form label-position="left" style="padding: 20px 10px">
                    <el-form-item label="类型:" label-width="160px">
                      <el-select
                        v-model="item.types"
                        placeholder="请选择类型"
                        @change="typesChange($event, item.key, index)"
                      >
                        <el-option
                          v-for="item in typesOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="规则:" label-width="160px">
                      <el-select
                        v-model="item.rules"
                        multiple
                        default-first-option
                        @change="typesChange($event, item.key, index)"
                      >
                        <el-option
                          v-for="item in rulesOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <div v-if="item.types == 'select'">
                      <el-form-item label="选项:" label-width="160px">
                        <el-select
                          v-model="item.select.options"
                          multiple
                          filterable
                          allow-create
                          @change="typesChange($event, item.key, index)"
                        >
                        </el-select>
                      </el-form-item>
                      <el-form-item label="多选:" label-width="160px">
                        <el-select v-model="item.select.multi">
                          <el-option label="是" :value="true"> </el-option>
                          <el-option label="否" :value="false"> </el-option>
                        </el-select>
                      </el-form-item>
                    </div>
                    <div v-if="item.types == 'file'">
                      <el-form-item
                        label="接收上传的文件类型:"
                        label-width="160px"
                      >
                        <el-input
                          v-model="item.file.accept"
                          placeholder="请输入接收上传的文件类型"
                          style="width: 202px"
                          @change="typesChange($event, item.key, index)"
                        ></el-input>
                      </el-form-item>
                    </div>
                  </el-form>
                </div>
              </ElCollapseItem>
            </ElCollapse>
          </div>
          <div style="width: 50%">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <el-button
                  style="float: left"
                  icon="el-icon-view"
                  type="text"
                  circle
                  @click="openpreviewResultsDialog"
                ></el-button>
                <el-button
                  style="float: right"
                  icon="el-icon-tickets"
                  type="text"
                  circle
                  @click="CopyCode"
                ></el-button>
              </div>
              <div style="background: #eee; height: 500px; overflow: auto">
                <pre>
                {{ generatedCodeStart }}
              </pre
                >
                <pre v-for="col in cols" :key="col.key">
                {{ col.tableColumn }}
              </pre
                >
                <pre>
                {{ generatedCodeEnd }}
               </pre
                >
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
      <el-card class="box-card" v-if="resData">
        <div style="height: 500px; overflow: auto">
          <pre v-highlightjs> <code class="json">{{ resData }}</code></pre>
        </div>
      </el-card>
    </el-card>
    <div>
      <el-dialog
        title="预览结果"
        :visible.sync="previewResultsDialog"
        @closed="previewResultsDialog = false"
      >
        <!-- <div v-text="previewResults"></div> -->
        <com1 :html="previewResults" :formData="formData"><com></com></com1>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import ElCollapseItem from "@/components/collapse/collapse-item";
import ElCollapse from "@/components/collapse/collapse";
import axios from "@/utils/request";
import Vue from "vue";
let com1 = Vue.component("com1", {
  props: {
    html: String,
    formData: Object,
  },
});
let fixedRules = {
  require: { required: true, message: "不能为空", trigger: "blur" },
  number: { type: "number", message: "必须为数字值" },
  email: {
    type: "email",
    message: "请输入正确的邮箱地址",
    trigger: ["blur", "change"],
  },
};
export default {
  name: "Index",
  components: {
    ElCollapseItem,
    ElCollapse,
  },
  data() {
    return {
      BaseURL:
        "http://localhost:9999/v0/api/autosql/tables/list?page=1&name=addresses",
      headers: [{ key: "", value: "" }],
      activeName: "1",
      resData: "",
      DataPath: "data.data",
      cols: [],
      generatedCodeStart: "",
      generatedCodeEnd: "",
      formData: [],
      previewResults: "",
      previewResultsDialog: false,

      /**
       * 选择框
       */
      typesOptions: [
        { label: "文本", value: "input" },
        { label: "文本域", value: "textarea" },
        { label: "选择框", value: "select" },
        { label: "时间(年月日)", value: "time" },
        { label: "时间(年月日 时分秒)", value: "specificTime" },
        { label: "文件", value: "file" },
      ],
      rulesOptions: [
        { label: "必填", value: "require" },
        { label: "数字", value: "number" },
        { label: "邮箱", value: "email" },
      ],
    };
  },
  async created() {
    await this.SendRequest();
    setTimeout(() => {
      this.toGetColumnName();
    }, 500);
  },
  methods: {
    startDrag: (evt, index) => {
      evt.dataTransfer.dropEffect = "move";
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("itemID", index);
    },
    onDrop(evt, index) {
      const itemID = evt.dataTransfer.getData("itemID");
      let cols = JSON.parse(JSON.stringify(this.cols));
      let temp = cols[itemID];
      cols[itemID] = cols[index];
      cols[index] = temp;
      this.cols = cols;
    },
    //发送请求
    SendRequest() {
      let headers = {};
      for (const item of this.headers) {
        if (item.key != "") {
          headers[item.key] = headers.value;
        }
      }
      axios
        .get(this.BaseURL, { headers })
        .then((res) => {
          this.resData = res;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    //添加头部
    AddHeaders() {
      this.headers.push({ key: "", value: "" });
    },
    //获取列名
    toGetColumnName() {
      let cols = this.DataPath.split(".");
      let res = JSON.parse(JSON.stringify(this.resData));
      let formData = {};
      for (const col of cols) {
        res = res[col];
      }
      if (res instanceof Array) {
        if (res.length > 0) {
          this.cols = [];
          for (const key in res[0]) {
            formData[key] = "";
            let tableColumn = `
       <el-form-item
          label="${key}:"
          label-width="140px"
          style="font-size: 18px"
          prop="${key}"
        >
          <el-input
            v-model="formData.${key}"
            auto-complete="off"
            style="width: 400px"
          />
        </el-form-item>`;
            this.cols.push({
              title: key,
              key: key,
              tableColumn: tableColumn,
              tmp: "",
              types: "input",
              rules: [],
              input: {
                IsNumber: false,
                maxLength: 0,
              },
              file: {
                accept: "*",
              },
              select: {
                options: [],
                multi: false,
              },
            });
          }
          this.generatedCodeStart = `
<el-form
        :model="formData"
        label-position="left"
        style="padding: 20px 10px"
        ref="ruleForm"
>`;
          this.generatedCodeEnd = `
</el-form>`;
        }
        this.formData = formData;
      }
    },
    //修改模板内容
    ChangeTmp(value, key, index) {
      if (value) {
        this.cols[index].tableColumn = `
        <el-table-column
        prop="${key}"
        label="${key}"
        align="center"
        :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            ${value}
          </template>
        </el-table-column>`;
      } else {
        this.cols[index].tableColumn = `
        <el-table-column
          prop="${key}"
          label="${key}"
          align="center"
          :show-overflow-tooltip="true"
        />`;
      }
    },

    //类型发生变化
    typesChange(value, key, index) {
      let rules = this.cols[index].rules;
      let rulesResult = [];
      for (const rule of rules) {
        rulesResult.push(JSON.stringify(fixedRules[rule]));
      }
      let code;
      if (rulesResult.length > 0) {
        code = `
        <el-form-item
            label="${key}:"
            label-width="140px"
            style="font-size: 18px"
            prop="${key}"
            :rules='${rulesResult}'
        >   
        `;
      } else {
        code = `
        <el-form-item
            label="${key}:"
            label-width="140px"
            style="font-size: 18px"
            prop="${key}"
        >
        `;
      }
      code += this.getTypeCode(value, key, index);
      code += `
        </el-form-item>`;
      this.cols[index].tableColumn = code;
    },
    //获取类型代码
    getTypeCode(_, key, index) {
      let value = this.cols[index].types;
      let code = "";
      switch (value) {
        case "input":
          if (this.cols[index].rules.indexOf("number") != -1) {
            code += `
            <el-input
            v-model.number="formData.${key}"
            auto-complete="off"
            style="width: 400px"
          />
            `;
          } else {
            code += `
            <el-input
            v-model="formData.${key}"
            auto-complete="off"
            style="width: 400px"
          />
            `;
          }

          break;
        case "textarea":
          code += `
            <el-input
            v-model="formData.${key}"
            auto-complete="off"
            style="width: 400px"
            autosize
            type="textarea"
          />
        `;
          break;
        case "select":
          let options = "";
          for (const option of this.cols[index].select.options) {
            options += `
            <el-option label="${option}" :value="${option}"> </el-option>
            `;
          }
          code += `
           <el-select v-model="formData.${key}">
               ${options}
           </el-select>
        `;
          break;
        case "time":
          code += `
            <el-date-picker
                v-model="formData.${key}"
                type="date"
                placeholder="选择日期时间"
                align="right"
                :picker-options="pickerOptions"
                style="width: 400px"
                value-format="yyyy-MM-dd"
              >
              </el-date-picker>
            `;
          break;
        case "specificTime":
          code += `
            <el-date-picker
                v-model="formData.${key}"
                type="datetime"
                placeholder="选择日期时间"
                align="right"
                :picker-options="pickerOptions"
                style="width: 400px"
                value-format="yyyy-MM-dd HH:mm:ss"
              >
              </el-date-picker>
            `;
          break;
        case "file":
          code += `
            <el-upload
                accept="${this.cols[index].file.accept}"
                action="#"
                :auto-upload="false"
                :on-change="handleChange"
                :on-remove="removeFile"
                drag
              >
                <div
                    style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                    "
                    >
                    <i slot="default" class="el-icon-plus"></i>
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                    </div>
                </div>
              </el-upload>`;
          break;
        default:
          break;
      }
      return code;
    },
    //复制代码
    CopyCode() {
      let data = "";
      data += this.generatedCodeStart;
      for (const col of this.cols) {
        data += col.tableColumn;
      }
      data += this.generatedCodeEnd;
      this.$copyText(data)
        .then((e) => {
          this.$message.success("复制成功!!!");
        })
        .catch((err) => {
          this.$message.error("复制失败!!!");
        });
    },
    //
    openpreviewResultsDialog() {
      let data = "";
      data += this.generatedCodeStart;
      for (const col of this.cols) {
        data += col.tableColumn;
      }
      data += this.generatedCodeEnd;
      this.previewResults = data;
      this.previewResultsDialog = true;
      com1.options.template = this.previewResults;
    },
  },
};
</script>

<style scope>
pre {
  margin: 0;
  font-size: 14px;
}
.item {
  margin: 10px 0;
}
</style>