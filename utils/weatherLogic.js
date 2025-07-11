async function getWeather(lat, lon){
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation,cloudcover,wind_speed_10m`

    try{

        const response = await fetch(url)

        if(!response.ok){
            throw new Error("Weather API Error")
        }
        const data = await response.json()
        return data

    } catch (err) {

        console.log(err)
        throw err

    }
}

module.exports = getWeather;