function populateForm(conf) {

    $('#confForm [name="minRH"]').val(conf.humidity.min);
    $('#confForm [name="maxRH"]').val(conf.humidity.max);

    $('#confForm [name="fanOn"]').val(conf.extractionFan.minutesOn);
    $('#confForm [name="fanOff"]').val(conf.extractionFan.minutesOff);
    $('#confForm [name="fanGPIO"]').val(conf.extractionFan.gpio);

    $('#confForm [name="sensorGPIO"]').val(conf.sensor.gpio);
    $('#confForm [name="sensorType"]').val(conf.sensor.type);

    $('#confForm [name="misterGPIO"]').val(conf.mister.gpio);
    
    $('#confForm [name="misterOn"]').val(conf.mister.minutesOn);
    $('#confForm [name="misterOff"]').val(conf.mister.minutesOff);
    
}

$.ajax({
    url: '/conf.json',
    type: "GET",
    success: populateForm
});