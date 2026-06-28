<template>
  <div style="width: 350px; padding: 20px;">
    <el-select
      v-model="selectedValues"
      multiple
      collapse-tags
      collapse-tags-tooltip
      placeholder="请选择（支持全选/反选）"
      style="width: 100%;"
    >
      <!-- 全选/反选头部 -->
      <el-option
        key="select-all"
        :value="null"
        disabled
        style="pointer-events: none;"
      >
        <div
          style="
            pointer-events: auto;
            padding: 0 20px;
            line-height: 40px;
            border-bottom: 1px solid #dcdfe6;
            cursor: pointer;
          "
          @click.stop="toggleAll"
        >
          <el-checkbox
            :value="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="toggleAll"
            @click.native.stop
          >
            <span style="font-weight: 500;">全选 / 反选</span>
          </el-checkbox>
        </div>
      </el-option>

      <!-- 普通选项：点击行或点击复选框均可切换 -->
      <el-option
        v-for="item in options"
        :key="item.value"
        :value="item.value"
      >
        <div
          style="
            display: flex;
            align-items: center;
            padding: 0 20px;
            height: 34px;
            cursor: pointer;
          "
          @click.stop="toggleItem(item.value)"
        >
          <el-checkbox
            :value="selectedValues.includes(item.value)"
            @change="toggleItem(item.value)"
            @click.native.stop
          >
            {{ item.label }}
          </el-checkbox>
        </div>
      </el-option>
    </el-select>

    <!-- 调试信息 -->
    <p style="margin-top: 10px; color: #909399; font-size: 14px;">
      已选值：{{ selectedValues.join('、') || '无' }}
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      options: [
        { label: '苹果', value: 'apple' },
        { label: '香蕉', value: 'banana' },
        { label: '橙子', value: 'orange' },
        { label: '西瓜', value: 'watermelon' },
        { label: '草莓', value: 'strawberry' }
      ],
      selectedValues: []
    };
  },
  computed: {
    // 是否全部选中
    isAllSelected() {
      return this.selectedValues.length === this.options.length;
    },
    // 是否部分选中（半选状态）
    isIndeterminate() {
      const len = this.selectedValues.length;
      return len > 0 && len < this.options.length;
    }
  },
  methods: {
    // 切换单个选项
    toggleItem(value) {
      if (this.selectedValues.includes(value)) {
        this.selectedValues = this.selectedValues.filter(v => v !== value);
      } else {
        this.selectedValues = [...this.selectedValues, value];
      }
    },
    // 全选 / 反选
    toggleAll() {
      if (this.isAllSelected) {
        this.selectedValues = [];
      } else {
        this.selectedValues = this.options.map(item => item.value);
      }
    }
  }
};
</script>

<style scoped>
.el-select-dropdown .el-checkbox {
  display: flex;
  align-items: center;
  margin-right: 0;
}
.el-select-dropdown .el-checkbox .el-checkbox__label {
  padding-left: 8px;
}
</style>
