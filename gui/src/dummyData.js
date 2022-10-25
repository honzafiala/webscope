export default function getDummyData() {
    let data = {};
    data.sampleRate = 100000;
    data.samples = 50000; 

    data.channels = [[], [], []]
    for (let i = 0; i < data.samples; i++) {
        data.channels[0].push(i % 256 / 100+ 5);
        data.channels[1].push(10 + i % 2560*2 / 1000);
        data.channels[2].push(Math.sin(i) * 3 + 20);
    }
    return data;
}