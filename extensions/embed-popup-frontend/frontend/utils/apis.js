export const apiLink = window.location.protocol + "//" + window.location.host + '/apps/frontend';


export const getResource = async () => {
    try {
        const response = await fetch(`${apiLink}/proxy/resource`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const getNextTierReward = async (rewards) => {
    try {
        const response = await fetch(`${apiLink}/proxy/tier/reward?rewards=${rewards}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const createReward = async (customerId, id) => {
    try {
        const response = await fetch(`${apiLink}/proxy/reward?redeem_program_id=${id}`, {
            method: "POST",
            cache: 'no-cache',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

export const updateCustomer = async (customerId,dob) => {
    try {
        const response = await fetch(`${apiLink}/proxy/customer?dob=${dob}`, {
            method: "PUT",
            cache: 'no-cache',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Methods": "PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        })

        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return null;
    }
}

