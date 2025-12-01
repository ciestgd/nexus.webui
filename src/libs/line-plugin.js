const linePlugin = {
    id: 'extendLine',
    beforeDatasetsDraw: function (chart, args, options) {
        const { extendLength = 0, extendOffset = 5 } = options;
        const ctx = chart.ctx;
        const xScale = chart.scales.x;
        chart.data.datasets.forEach((dataset, datasetIndex) => {
            if (dataset.type !== 'line' || dataset.hidden) {
                return;
            }
            const meta = chart.getDatasetMeta(datasetIndex);
            if (!meta || meta.hidden) {
                return;
            }
            ctx.save();
            ctx.beginPath();
            meta.data.forEach((segment, index) => {
                const prev = meta.data[index - 1];
                const next = meta.data[index + 1];
                const { x, y } = segment.getProps(['x', 'y']);

                if (index === 0) {
                    ctx.moveTo(xScale.left, y);
                    ctx.lineTo(x - 5, y);
                } else {
                    let prevModel = prev.getProps(['x', 'y']);
                    let nextModel = next ? next.getProps(['x', 'y']) : null;
                    if (nextModel && prevModel.x < xScale.left && nextModel.x > xScale.right) {
                        const lineLength = Math.sqrt(Math.pow(nextModel.x - prevModel.x, 2) + Math.pow(nextModel.y - prevModel.y, 2));
                        const extendX = ((nextModel.x - prevModel.x) / lineLength) * extendLength;
                        const extendY = ((nextModel.y - prevModel.y) / lineLength) * extendLength;
                        const offsetY = ((nextModel.y - prevModel.y) / lineLength) * extendOffset;
                        ctx.lineTo(prevModel.x - extendX, prevModel.y - extendY + offsetY);
                        ctx.lineTo(x, y + offsetY);
                        ctx.lineTo(nextModel.x + extendX, nextModel.y + extendY + offsetY);
                    } else {
                        if (index === meta.data.length - 1) {
                            ctx.moveTo(x + 5, y);
                            ctx.lineTo(xScale.right, y);
                        }
                    }
                }
            });
            ctx.strokeStyle = dataset.borderColor;
            ctx.lineWidth = dataset.borderWidth + 0.5;
            ctx.setLineDash(dataset.borderDash);
            ctx.stroke();
            ctx.restore();
        });
    },
};
export default linePlugin;
