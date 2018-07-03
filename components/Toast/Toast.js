// components/toast/toast.js
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        title: {
            type: String,
            value: ""
        },
        content: {
            type: String,
            value: ""
        },
        duration: {
            type: Number,
            value: 1500
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isShow: false
    },
    attached() {
        this.setData({
            content: this.replaceStr(this.data.content)
        })
        
    },
    /**
     * 组件的方法列表
     */
    methods: {
        replaceStr(str) {
            str = str.replace(/&nbsp;/g, ' ');
            str = str.replace(/&lt;/g, '<');
            str = str.replace(/&gt;/g, '>');
            str = str.replace(/&amp;/g, '&');
            str = str.replace(/&apos/g, '\'');
            str = str.replace(/&ensp;/g, '  ');
            str = str.replace(/&emsp;/g, '    ');
            return str
        },
        showToast(){
            this.setData({
                isShow: true
            })
            setTimeout(() => {
                this.setData({
                    isShow: false
                })
            }, this.data.duration)
        }
    }
})
