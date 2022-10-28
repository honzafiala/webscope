export default function getDummyData() {
    let data = [];
    data.samples = 192*1024; 

    for (let i = 0; i < data.samples; i++) {
        data.push((i / 100) % 256);

    }
    return data;
}