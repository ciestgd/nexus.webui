<template>
    <div class="file-item">
        <div class="file-item-title">{{ data.title }}</div>
        <div class="file-item-content">
            <el-input v-model="fileName" placeholder="Please input" readonly size="small" />
            <Icon class="icon-button icon" @click="downloadFile" name="download" size="20" />
            <Icon class="icon-button icon" @click="viewFile" name="view" size="20" />
        </div>
        <div class="filet-item-select" v-if="data.type === 'layers'">
            Layer:
            <el-select v-model="activeLayer" @change="handleSelect" class="select-box" placeholder="Select" size="small">
                <el-option v-for="item in data.options" :key="item" :label="item" :value="item" />
            </el-select>
        </div>
    </div>
</template>
<script setup>
import Worker from '@/libs/worker/data-input-worker.js?worker';
import { useProjectYearStore } from '@/store/project-year';
import { ElLoading } from 'element-plus';
const projectYearStore = useProjectYearStore();
const emits = defineEmits(['onView', 'onTables']);

const props = defineProps({
    data: {
        type: Object,
        default: () => {},
    },
    activeTitle: {
        type: String,
        default: '',
    },
});

let { data, activeTitle } = toRefs(props);
const year = computed(() => projectYearStore.projectYear);
const headOptions = ref([]);
const dataList = ref([]);
const tableSelectOptions = ref([]);
const tablesData = ref({});

const fileData = reactive({
    type: '',
    tableNames: [],
    data: {
        headList: [],
        list: [],
    },
});

const getWorker = () => {
    const worker = new Worker();
    worker.onmessage = (e) => {
        try {
            let result = e.data;
            if (result.state === 200) {
                if (result.type == 'other') {
                    let { type, tableNames, headList } = result.data;
                    fileData.type = type;
                    fileData.tableNames = tableNames;
                    fileData.data.headList = headList;
                } else if (result.type == 'list') {
                    let arr = result.data;
                    fileData.data.list.push(...arr);
                } else if (result.type == 'all') {
                    let { type, tableNames, data } = result.data;
                    fileData.type = type;
                    fileData.tableNames = tableNames;
                    fileData.data = data;
                }
            }
            if (result.status === 'end') {
                formatData();
                worker.terminate();
                endLoading(startLoading());
            }
        } finally {
            // endLoading(startLoading());
        }
    };
    return worker;
};
watch(
    () => projectYearStore.projectYear,
    () => {
        if (data.value.type === 'year') {
            dataList.value = [];
            fileData.data.list = [];
        }
        if (activeTitle.value === data.value.name) {
            viewFile();
        }
    }
);
watch(
    () => props.activeTitle,
    (val) => {
        if (val === data.value.name) {
            viewFile();
        }
    }
);
const formatData = () => {
    let filePath = getFilePath();
    if (fileData.type === 'xlsx') {
        let { tableNames, data } = fileData;
        tableSelectOptions.value = tableNames || [];
        tablesData.value = data;
        let { headList, list } = tablesData.value[tableSelectOptions.value[0]];
        headOptions.value = headList;
        dataList.value = list;
    } else {
        let { headList, list } = fileData.data;
        headOptions.value = headList;
        dataList.value = list;
    }
    emits('onTables', tableSelectOptions.value, tablesData.value);
    emits('onView', headOptions.value, dataList.value, fileName.value, data.value.name, filePath);
};
const fileName = computed(() => {
    if (data.value.type === 'layers' || data.value.type === 'static') {
        return data.value.fileName;
    } else if (data.value.type === 'year') {
        let filePath = data.value.path[year.value].split('/').map((item) => item);
        return filePath[filePath.length - 1];
    }
});
const activeLayer = ref('');
if (data.value.type && data.value.type === 'layers') {
    activeLayer.value = data.value.options[0];
}

const handleSelect = () => {
    dataList.value = [];
    fileData.data.list = [];
    viewFile();
};

const downloadFile = () => {
    let filePath = getFilePath();
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = filePath;
    a.download = fileName.value;
    a.click();
};
const getFilePath = () => {
    let filePath = '';
    if (data.value.type === 'layers') {
        filePath = data.value.path[activeLayer.value];
    } else if (data.value.type === 'year') {
        filePath = data.value.path[year.value];
    } else if (data.value.type === 'static') {
        filePath = data.value.path;
    }
    return filePath;
};

const startLoading = () => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    });
    return loading;
};
const endLoading = (loading) => {
    loading.close();
};
const viewFile = async () => {
    let filePath = getFilePath();
    if (!dataList.value.length) {
        startLoading();
        const worker = getWorker();
        worker.postMessage(filePath);
    } else {
        emits('onTables', tableSelectOptions.value, tablesData.value);
        emits('onView', headOptions.value, dataList.value, fileName.value, data.value.name, filePath);
    }
};
</script>
<style lang="scss" scoped>
.file-item {
    .file-item-title {
        font-size: 12px;
    }
    .file-item-content {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 5px;
        .icon {
            width: 20px;
            height: 20px;
            margin: 0 5px;
        }
    }
    .filet-item-select {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding-right: 5px;
        margin-top: 5px;
        .select-box {
            flex: 1;
            margin-left: 5px;
        }
    }
}
</style>
