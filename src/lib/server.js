import { useEffect, useState } from "react";
import API_URL from "../../config";

export const useInstances = () => {
  const [instances, setInstances] = useState([]);

  const updateInstances = () => {
    fetch(`${API_URL}/get_all`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "SUCCESS") {
          setInstances(data.data);
        }
      });
  };

  useEffect(() => {
    updateInstances();
    const interval = setInterval(updateInstances, 2000);
    return () => clearInterval(interval);
  }, []);

  return { instances, updateInstances };
};

export async function killAllInstances() {
  try {
    await fetch(`${API_URL}/kill_all`, { method: "POST" });
  } catch (e) {
    throw new Error("Could not kill all instances");
  }
}

async function sendRequest(url, requestOptions) {
  const response = await fetch(url, requestOptions);
  const data = await response.json();
  return data;
}

export class EFlintInstance {
  constructor(uuid = null, template_name = "src/main/resources/examples/buyer_seller.eflint") {
    this.uuid = uuid;
    this.template_name = template_name;
  }

  uuid = null;

  async launchInstance(values = {}) {
    try {
      const requestOptions = {
        method: "POST",
        body: JSON.stringify({
          "template-name": this.template_name,
          values,
        }),
      };
      const data = await sendRequest(`${API_URL}/create`, requestOptions);
      if (data.status !== "SUCCESS") {
        throw new Error("Could not launch instance");
      }
      this.uuid = data.data.uuid;
    } catch (e) {
      throw new Error("Could not launch instance");
    }
  }

  async killInstance() {
    if (!this.uuid) return new Error("Instance not launched");

    try {
      const requestOptions = {
        method: "POST",
        body: JSON.stringify({
          uuid: this.uuid,
          request_type: "command",
          data: {
            command: "kill",
          },
        }),
      };
      await sendRequest(`${API_URL}/kill`, requestOptions);
    } catch (e) {
      throw new Error("Could not kill instance");
    }
  }

  async sendCommand(command, properties = {}) {
    if (!this.uuid) return new Error("Instance not launched");
    const data = {};
    data["command"] = command;
    for (const [key, value] of Object.entries(properties)) {
      data[key] = value;
    }

    const requestOptions = {
      method: "POST",
      body: JSON.stringify({
        uuid: this.uuid,
        "request-type": "command",
        data,
      }),
    };

    return await sendRequest(`${API_URL}/command`, requestOptions);
  }

  async status() {
    return this.sendCommand("status");
  }

  async facts() {
    return this.sendCommand("facts");
  }

  async terminate(value) {
    return this.sendCommand("terminate", { value });
  }

  async create(value) {
    return this.sendCommand("create", { value });
  }

  async executePhrase(phrase) {
    return this.sendCommand("phrase", { text: phrase });
  }

  async revert(id, destructive = true) {
    return this.sendCommand("revert", { value: parseInt(id), destructive });
  }

  async jump(id) {
    return this.sendCommand("revert", { value: parseInt(id) });
  }

  async trace_heads() {
    return this.sendCommand("trace-heads");
  }

  async history() {
    return this.sendCommand("history");
  }

  async create_export(id = null) {
    const data = {};
    if (id) data.value = id;
    return this.sendCommand("create-export", data);
  }

  async load_export(graph) {
    return this.sendCommand("load-export", { graph });
  }
}
