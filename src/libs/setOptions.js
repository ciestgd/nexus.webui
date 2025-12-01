const setOptions = async (optionsRef, api, idPropName, isHasAll = false) => {
    if (optionsRef.value.length === 0) {
        const result = [];
        if (isHasAll) {
            result.push({
                id: '',
                label: 'ALL',
                centerLon: '',
                centerLat: '',
            });
        }
        const data = await api();
        for (let i = 0, len = data.length; i < len; i++) {
            const item = data[i];
            result.push({
                id: item[idPropName],
                label: item.name,
                centerLon: item.centerLon,
                centerLat: item.centerLat,
            });
        }
        optionsRef.value = result;
    }
};
export default setOptions;
