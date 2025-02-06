const carDetails = {
    car1: {
        name: "Mercedes Benz-CLS500",
        vin: "19456",
        chip: "Úprava ECU - výkon",
        lock: "Žádný",
        engine: "Motor s turbem",
        geometry: "Seřízení geometrie T2",
        price: "950 000 Kč",
    },
    car2: {
        name: "Audi S4 Avant",
        vin: "20989",
        wheeltype: "Shadow",
        frontwheel: "Široká",
        rearwheel: "Široká",
        chip: "Úprava ECU - výkon",
        lock: "Žádný",
        engine: "Motor s turbem",
        rpmlock: "Zvýšený zámek +8",
        brakes: "Silnější brzdy",
        seatbelt: "Závodní šestibodové",
        geometry: "Seřízení geometrie T2",
        safety: "Základní bezp. polo-rám (OCEL)",
        price: "950 000 Kč",
    },
    car3: {
        name: "Toytota Supra",
        vin: "17328",
        frontwheel: "Široká",
        rearwheel: "Široká",
        chip: "Úprava ECU - výkon",
        lock: "Žádný",
        engine: "Motor s twin-turbem",
        rpmlock: "Zvýšený zámek +8",
        balance: "Zatížená přední část",
        brakes: "Silnější brzdy",
        seatbelt: "Závodní šestibodové",
        geometry: "Seřízení geometrie T2",
        safety: "Základní bezp. rám (OCEL)",
        price: "1 275 000 Kč",
    },
    car4: {
        name: "BMW 530i xDrive",
        vin: "----",
        chip: "Úprava ECU - výkon",
        lock: "Žádný",
        engine: "Motor s turbem",
        brakes: "Silnější brzdy",
        seatbelt: "Závodní šestibodové",
        price: "950 000 Kč",
    }
};

function openModal(carId) {
    const car = carDetails[carId];
    document.getElementById("modal-title").textContent = car.name || "Neznámé vozidlo";
    
    let detailsHTML = "";
    
    const fields = {
        "VIN": car.vin,
        "Najeto": car.mileage,
        "Motor": car.engine,
        "Řídící jednotka": car.chip,
        "Omezovač": car.lock,
        "Zámek Otáčení": car.rpmlock,
        "Těžiště": car.balance,
        "Brzdy": car.brakes,
        "Geometrie": car.geometry,
        "Typ Kol": car.wheeltype,
        "Zadní Pneu": car.rearwheel,
        "Přední Pneu": car.frontwheel,
        "Pásy": car.seatbelt,
        "Ochranné Prvky": car.safety,
        "Spoiler": car.spoiler,
        "Cena": car.price,
        "Barva": car.color,
    };
    
    for (const [key, value] of Object.entries(fields)) {
        if (value) {
            if (key === "Cena") {
                detailsHTML += `<p style="font-weight: bold; font-family: poppins; text-align:right;"><strong>${key}:</strong> ${value}</p>`;
            } else {
                detailsHTML += `<p><strong style="font-family: poppins;">${key}:</strong> ${value}</p>`;
            }
        }
    }
    
    document.getElementById("modal-body").innerHTML = detailsHTML;
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}
