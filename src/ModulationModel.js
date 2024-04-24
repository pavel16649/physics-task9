import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { fft } from 'fft-js';
import './main.css';

function ModulationModel() {
    const [carrierFrequency, setCarrierFrequency] = useState(100);
    const [informationFrequency, setInformationFrequency] = useState(10);
    const [modulationIndex, setModulationIndex] = useState(0.5);

    const signalLength = 4096;
    const samplingRate = signalLength;

    const [newFreqCar, setNewFreqCar] = useState(100);
    const [newFreqInf, setNewFreqInf] = useState(10);
    const [newInd, setNewInd] = useState(0.5);

    const [showModalFreq, setShowModalFreq] = useState(false);
    const [showModalInd, setShowModalInd] = useState(false);

    const handleCloseModalFreq = () => {
        setShowModalFreq(false);
    }

    const handleCloseModalInd = () => {
        setShowModalInd(false);
    }

    const handleButton = () => {
        handleCarrierFrequencyChange();
        handleInformationFrequencyChange();
        handleModulationIndexChange();
    }

    const handleCarrierFrequencyChange = () => {
        if (newFreqCar <= 0) {
            setShowModalFreq(true);
        } else {
            setCarrierFrequency(newFreqCar);
        }
    };

    const handleInformationFrequencyChange = () => {
        if (newFreqInf <= 0) {
            setShowModalFreq(true);
        } else {
            setInformationFrequency(newFreqInf);
        }
    };

    const handleModulationIndexChange = () => {
        if (newInd < 0 || newInd > 1) {
            setShowModalInd(true);
        } else {
            setModulationIndex(newInd);
        }
    };

    const carrierSignal = new Array(signalLength).fill(0).map((_, i) => {
        return Math.sin(2 * Math.PI * carrierFrequency * i / samplingRate);
    });

    const informationSignal = new Array(signalLength).fill(0).map((_, i) => {
        return Math.sin(2 * Math.PI * informationFrequency * i / samplingRate);
    });

    const modulatedSignal = new Array(signalLength).fill(0).map((_, i) => {
        return (1 + modulationIndex * informationSignal[i]) * carrierSignal[i];
    });

    // Apply a Hamming window to the signals
    const hammingWindow = (i, N) => 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
    const windowedCarrierSignal = carrierSignal.map((x, i) => x * hammingWindow(i, signalLength));
    const windowedInformationSignal = informationSignal.map((x, i) => x * hammingWindow(i, signalLength));
    const windowedModulatedSignal = modulatedSignal.map((x, i) => x * hammingWindow(i, signalLength));

    // Take the FFT of the windowed signals
    const carrierComplexSignal = windowedCarrierSignal.map((x) => [x, 0]);
    const informationComplexSignal = windowedInformationSignal.map((x) => [x, 0]);
    const modulatedComplexSignal = windowedModulatedSignal.map((x) => [x, 0]);

    const carrierSpectrum = fft(carrierComplexSignal);
    const informationSpectrum = fft(informationComplexSignal);
    const modulatedSpectrum = fft(modulatedComplexSignal);

    // Calculate the magnitude of the complex spectra
    const carrierSpectrumMagnitude = carrierSpectrum.map((complex) => Math.sqrt(complex[0] ** 2 + complex[1] ** 2));
    const informationSpectrumMagnitude = informationSpectrum.map((complex) => Math.sqrt(complex[0] ** 2 + complex[1] ** 2));
    const modulatedSpectrumMagnitude = modulatedSpectrum.map((complex) => Math.sqrt(complex[0] ** 2 + complex[1] ** 2));

    // Create the plots
    const carrierSignalPlot = (
        <Plot
            data={[{ x: Array(signalLength).fill(0).map((_, i) => i / samplingRate), y: carrierSignal, type: 'line' }]}
            layout={{ title: 'Carrier Signal', xaxis: { title: 'Time (s)' }, yaxis: { title: 'Amplitude' } }}
        />
    );

    const informationSignalPlot = (
        <Plot
            data={[{ x: Array(signalLength).fill(0).map((_, i) => i / samplingRate), y: informationSignal, type: 'line' }]}
            layout={{ title: 'Information Signal', xaxis: { title: 'Time (s)' }, yaxis: { title: 'Amplitude' } }}
        />
    );

    const modulatedSignalPlot = (
        <Plot
            data={[{ x: Array(signalLength).fill(0).map((_, i) => i / samplingRate), y: modulatedSignal, type: 'line' }]}
            layout={{ title: 'Modulated Signal', xaxis: { title: 'Time (s)' }, yaxis: { title: 'Amplitude' } }}
        />
    );

    const carrierSpectrumPlot = (
        <Plot
            data={[{ x: Array(signalLength / 2).fill(0).map((_, i) => i / signalLength * samplingRate), y: carrierSpectrumMagnitude.slice(0, signalLength / 2), type: 'line' }]}
            layout={{ title: 'Carrier Spectrum', xaxis: { title: 'Frequency (Hz)', range: [0, 200] }, yaxis: { title: 'Magnitude' } }}
        />
    );

    const informationSpectrumPlot = (
        <Plot
            data={[{ x: Array(signalLength / 2).fill(0).map((_, i) => i / signalLength * samplingRate), y: informationSpectrumMagnitude.slice(0, signalLength / 2), type: 'line' }]}
            layout={{ title: 'Information Spectrum', xaxis: { title: 'Frequency (Hz)', range: [0, 200] }, yaxis: { title: 'Magnitude' } }}
        />
    );

    const modulatedSpectrumPlot = (
        <Plot
            data={[{ x: Array(signalLength / 2).fill(0).map((_, i) => i / signalLength * samplingRate), y: modulatedSpectrumMagnitude.slice(0, signalLength / 2), type: 'line' }]}
            layout={{ title: 'Modulated Spectrum', xaxis: { title: 'Frequency (Hz)', range: [0, 200] }, yaxis: { title: 'Magnitude' } }}
        />
    );

    return (
        <div>
            <h1>Modulation Model</h1>
            <p>
                Carrier Frequency: <input type="number" value={newFreqCar}
                                          onChange={(e) => setNewFreqCar(e.target.valueAsNumber)}/>
            </p>
            <p>
                Information Frequency: <input type="number" value={newFreqInf}
                                              onChange={(e) => setNewFreqInf(e.target.valueAsNumber)}/>
            </p>
            <p>
                Modulation Index: <input type="number" value={newInd}
                                         onChange={(e) => setNewInd(e.target.valueAsNumber)}/>
            </p>
            <p>
                <button onClick={handleButton}>Построить</button>
            </p>
            {carrierSignalPlot}
            {informationSignalPlot}
            {modulatedSignalPlot}
            {carrierSpectrumPlot}
            {informationSpectrumPlot}
            {modulatedSpectrumPlot}
            {showModalFreq && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Предупреждение</h2>
                        <p>Частота должна быть положительной</p>
                        <button onClick={handleCloseModalFreq}>Попробую другую</button>
                    </div>
                </div>
            )}
            {showModalInd && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Предупреждение</h2>
                        <p>Индекс модуляции должен быть в пределах от 0 до 1</p>
                        <button onClick={handleCloseModalInd}>Попробую другой</button>
                    </div>
                </div>
            )}
        </div>
    );
}


export default ModulationModel;
