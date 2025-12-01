import { defineStore } from 'pinia';
import overlayer from '@/libs/map/layers/overlayer';
export const useLegendColorStore = defineStore('legendColor', {
    state: () => {
        return {
            labelList: [
                {
                    text: 'PM2.5',
                    id: 'Pm25',
                    // color: '#fd0000b2',
                    color: "#cc6677",
                    width: 0.5,
                    checkbox: true,
                    display: true,
                    colorDisplay: true,
                },
                {
                    text: 'Ozone &\n PM2.5',
                    id: 'O3AndPm25',
                    // color: '#c500ffb2',
                    color: '#882255',
                    width: 0.5,
                    checkbox: true,
                    display: true,
                    colorDisplay: true,
                },
                {
                    text: 'Ozone',
                    id: 'Ozone',
                    // color: '#0071fdb2',
                    color: '#88ccee',
                    width: 0.5,
                    checkbox: true,
                    display: true,
                    colorDisplay: true,
                },
                {
                    text: 'Toxics &\n Ozone',
                    id: 'ToxicAndOzone',
                    // color: '#4ce700b2',
                    color: '#44aa99',
                    width: 0.5,
                    checkbox: true,
                    display: true,
                    colorDisplay: true,
                },
                {
                    text: 'Toxics',
                    id: 'Toxics',
                    // color: '#fffe00b2',
                    color: '#ddcc77',
                    width: 0.5,
                    checkbox: true,
                    display: true,
                    colorDisplay: true,
                },
                {
                    text: 'Toxics &\n PM2.5',
                    id: 'ToxicAndPm25',
                    // color: '#fd6900b2',
                    color: '#999933',
                    width: 0.5,
                    checkbox: true,
                    display: true,
                    colorDisplay: true,
                },
                {
                    text: 'All Three',
                    id: 'allThree',
                    // color: '#000000b2',
                    color: '#484646',
                    width: 0.5,
                    checkbox: true,
                    display: true,
                    colorDisplay: true,
                },
                // {
                //     text: 'Age Demographics',
                //     id: 'Demographics',
                //     color: '#88BF6Cb2',
                //     width: 0.5,
                //     checkbox: true,
                //     display: true,
                //     colorDisplay: false,
                // },
                // {
                //     // text: 'Climate Risk',
                //     text: 'Heat Risk',
                //     id: 'Climate',
                //     // color: '#c84200b2',
                //     color: '#aa4499',
                //     width: 0.5,
                //     checkbox: true,
                //     display: true,
                //     colorDisplay: false,
                // },
            ],

            checkList: ['metrics'],
        };
    },
    actions: {
        init() {
            this.checkList = ['metrics'];
            overlayer.setVisible(true);
        },
        handleLayerChange(value = ['metrics']) {
            this.checkList = value;
            overlayer.setVisible(this.checkList.length > 0);
        },
    },
});
