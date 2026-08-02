import axios from "axios";

export const SECURITY_TOKEN_SCHEMA_ID = '685e7a342ec4242da906daca';
export const BEARER_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0.eyJleHAiOjE3NDg2MjYwMzEsImlhdCI6MTc0ODU5MDAzMSwianRpIjoiZjhjZjAyZmYtNjRlOC00NWJiLTg0YWQtNjljOTNiNjEyOWY2IiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLXNlcnZpY2Uua2V5Y2xvYWsuc3ZjLmNsdXN0ZXIubG9jYWw6ODA4MC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJhNzc4OTZmLTdjMWYtNDUwMS1iNGY2LTU0N2E3ZDI2ZGRlNiIsInR5cCI6IkJlYXJlciIsImF6cCI6IkhPTEFDUkFDWV9tb2JpdXMiLCJzaWQiOiI3YjYyYWIwYy0zYjZmLTQ1MzEtOTE0Yy0xMDhmNzczMGI3NTQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJIT0xBQ1JBQ1lfbW9iaXVzIjp7InJvbGVzIjpbIkhPTEFDUkFDWV9VU0VSIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJyZXF1ZXN0ZXJUeXBlIjoiVEVOQU5UIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ4cHggeHB4IiwidGVuYW50SWQiOiJiYTc3ODk2Zi03YzFmLTQ1MDEtYjRmNi01NDdhN2QyNmRkZTYiLCJwbGF0Zm9ybUlkIjoibW9iaXVzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicGFzc3dvcmRfdGVuYW50X3hweEBnYWlhbnNvbHV0aW9ucy5jb20iLCJnaXZlbl9uYW1lIjoieHB4IiwiZmFtaWx5X25hbWUiOiJ4cHgiLCJlbWFpbCI6InBhc3N3b3JkX3RlbmFudF94cHhAZ2FpYW5zb2x1dGlvbnMuY29tIn0.dSNWRM9s4nfxcNlMC8iUM_IbX7WIUm-BESIANlW7aourbKxJ_RxLmFacGLBHhbnJzDH1O2uzPPAg2ApwSEG7DV_tdw16oJZlzYLAMNfl9lZzBH9el3VgzAY1ke6SKZeNGacUookgwtgevkXrsnPnXQJvknfGetYCo-WkrNardJs0_kUBJDmFRfU2QLbG_pZ07Dznqoeo418imx3OB9AhyXo0wVWNOJiG2iXgxXSKtEU2x5-mPcU7XocMJ91G0_Vb9_I62krG6mmHteP2J-v0OEc3J1h-WTUp5HsEug0Ouq1B46mGdHdaJwiwcjHYpduR6FBGXbNEEIvCwwc6CBMJXA'
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1'
const devUrl = "https://ig.gov-cloud.ai";
const schemaId = "685e7a342ec4242da906daca";
const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0.eyJleHAiOjE3NDgzNjgwMjIsImlhdCI6MTc0ODMzMjAyMiwianRpIjoiNzAzZjE5MjEtODM2ZC00NjY3LWIzZWEtOTM3OWJlYWNiODAzIiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLXNlcnZpY2Uua2V5Y2xvYWsuc3ZjLmNsdXN0ZXIubG9jYWw6ODA4MC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJhNzc4OTZmLTdjMWYtNDUwMS1iNGY2LTU0N2E3ZDI2ZGRlNiIsInR5cCI6IkJlYXJlciIsImF6cCI6IkhPTEFDUkFDWV9tb2JpdXMiLCJzaWQiOiI3ZGJlZmIzMS00YmU5LTQ1MzktYTM2Yy02YTNjNDM5ZjgyOTYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJIT0xBQ1JBQ1lfbW9iaXVzIjp7InJvbGVzIjpbIkhPTEFDUkFDWV9VU0VSIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJyZXF1ZXN0ZXJUeXBlIjoiVEVOQU5UIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ4cHggeHB4IiwidGVuYW50SWQiOiJiYTc3ODk2Zi03YzFmLTQ1MDEtYjRmNi01NDdhN2QyNmRkZTYiLCJwbGF0Zm9ybUlkIjoibW9iaXVzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicGFzc3dvcmRfdGVuYW50X3hweEBnYWlhbnNvbHV0aW9ucy5jb20iLCJnaXZlbl9uYW1lIjoieHB4IiwiZmFtaWx5X25hbWUiOiJ4cHgiLCJlbWFpbCI6InBhc3N3b3JkX3RlbmFudF94cHhAZ2FpYW5zb2x1dGlvbnMuY29tIn0.YUELQcZKzYV4-O3WVf4fuNy0_uOZd1tusB0KOhzc2pmV9FgtF_qYv0Moi8xQY7raUs-BrYzGVTkGquAo3moV97lK_GJL9mRoVsvuzjgBqpgGb3uYcyqaVrmZNKbVkePUbZXqVdPc7XkfvdNODUNuHwZ6BOIcSvgv0xJtaKuCccWKD1K3zdfPMLSqUQxevnFcMJlJfKEF-YyFEGe8rxU9SWTfMKFTwwpfi4_d65ojnbZlMql6ht-ZfAxI3uGg3Ulo5sA8-M1v6tRV7olLXqcNqslCZuQkM1_N7jM_SyyrsWLq-hZSux_oJV5M4c-eIQltAstyZyNbRS7m0kzpcwZ42g"


export async function getSTData() {
    const body = {
    "dbType": "TIDB"
    // "filter": ""
    }
    // const url = `${devUrl}/pi-entity-instances-service/v2.0/schemas/${schemaId}/instances/list?page=0&size=20&showDBaaSReservedKeywords=false&showPageableMetaData=true`
    try {
    //     var res = await axios.post(url, body, {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     });
    // try {
        const response = await axios.get(`${apiUrl}/token/getAllTokens`)
        console.log(response)
        return response.data.tokens;
    } catch (e) {
        // if(e.response.status==403){
        //   var res2 = await generatePortalsAccessToken();
        //   console.log(res2);
        //   return await getFilteredEntities(data, schemaId, res2);
        // }
        console.log("Error in Getting Filtered Entities", e);
        return false;
    }
}

export async function setSTData(tokenData:any,cliamData:any) {
    const body = {
    "dbType": "TIDB"
    // "filter": ""
    }
    const url = `${devUrl}/pi-entity-instances-service/v2.0/schemas/${schemaId}/instances/list?page=0&size=20&showDBaaSReservedKeywords=false&showPageableMetaData=true`
    try {
        var res = await axios.post(url, body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (e) {
        // if(e.response.status==403){
        //   var res2 = await generatePortalsAccessToken();
        //   console.log(res2);
        //   return await getFilteredEntities(data, schemaId, res2);
        // }
        console.log("Error in Getting Filtered Entities", e);
        return false;
    }
}

export async function insertEntity(data: any, upsert = true) {
    
    console.log("payload data",data);
    let payloadData = {
        data: data,
    }
    
    console.log(payloadData);
    
    var res = await axios.post(`${devUrl}/pi-entity-instances-service/v2.0/schemas/${schemaId}/instances`, payloadData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    console.log("res", res);
    
    return res;
}


// const { createIdentity } = require('../../../controllers/identityController');
export async function getInvestorList(page = 0, size = 50) {
    // const schemaId = '6863defa2ec4242da906ed9d';
    // const url = `https://ig.gov-cloud.ai/pi-entity-instances-service/v2.0/schemas/${schemaId}/instances/list`;
    
    // const bearerToken='eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0.eyJleHAiOjE3NDg2MjYwMzEsImlhdCI6MTc0ODU5MDAzMSwianRpIjoiZjhjZjAyZmYtNjRlOC00NWJiLTg0YWQtNjljOTNiNjEyOWY2IiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLXNlcnZpY2Uua2V5Y2xvYWsuc3ZjLmNsdXN0ZXIubG9jYWw6ODA4MC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJhNzc4OTZmLTdjMWYtNDUwMS1iNGY2LTU0N2E3ZDI2ZGRlNiIsInR5cCI6IkJlYXJlciIsImF6cCI6IkhPTEFDUkFDWV9tb2JpdXMiLCJzaWQiOiI3YjYyYWIwYy0zYjZmLTQ1MzEtOTE0Yy0xMDhmNzczMGI3NTQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJIT0xBQ1JBQ1lfbW9iaXVzIjp7InJvbGVzIjpbIkhPTEFDUkFDWV9VU0VSIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJyZXF1ZXN0ZXJUeXBlIjoiVEVOQU5UIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ4cHggeHB4IiwidGVuYW50SWQiOiJiYTc3ODk2Zi03YzFmLTQ1MDEtYjRmNi01NDdhN2QyNmRkZTYiLCJwbGF0Zm9ybUlkIjoibW9iaXVzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicGFzc3dvcmRfdGVuYW50X3hweEBnYWlhbnNvbHV0aW9ucy5jb20iLCJnaXZlbl9uYW1lIjoieHB4IiwiZmFtaWx5X25hbWUiOiJ4cHgiLCJlbWFpbCI6InBhc3N3b3JkX3RlbmFudF94cHhAZ2FpYW5zb2x1dGlvbnMuY29tIn0.dSNWRM9s4nfxcNlMC8iUM_IbX7WIUm-BESIANlW7aourbKxJ_RxLmFacGLBHhbnJzDH1O2uzPPAg2ApwSEG7DV_tdw16oJZlzYLAMNfl9lZzBH9el3VgzAY1ke6SKZeNGacUookgwtgevkXrsnPnXQJvknfGetYCo-WkrNardJs0_kUBJDmFRfU2QLbG_pZ07Dznqoeo418imx3OB9AhyXo0wVWNOJiG2iXgxXSKtEU2x5-mPcU7XocMJ91G0_Vb9_I62krG6mmHteP2J-v0OEc3J1h-WTUp5HsEug0Ouq1B46mGdHdaJwiwcjHYpduR6FBGXbNEEIvCwwc6CBMJXA'
    //   const response = await axios(url,{
    //     method: 'POST',
    //     url: url,
    //     params: {
    //       page: page,
    //       size: size,
    //       showDBaaSReservedKeywords: true,
    //       showPageableMetaData: true
    //     },
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${bearerToken}`
    //     },
    //     data: {
    //       dbType: 'TIDB'
    //     }
    //   })
    //   return response.data

    try {
        const response = await axios.get(`${apiUrl}/investors`)
        console.log(response)
        return response.data;
    } catch (e) {
        console.log("Error in Getting Filtered Entities", e);
        return false;
    }


}
