import { useEffect, useMemo, useState } from "react";
import { EFlintInstance } from "../../lib/server";
import PropTypes from "prop-types";

const initEmptyContextData = (keys) => {
  const contextData = {};
  keys.forEach((key) => {
    contextData[key] = {
      data: null,
      loading: false,
      error: null,
    };
  });
  return contextData;
};

const setContextDataByKey = (prev, key, data, loading, error) => {
  const newContextData = { ...prev };
  newContextData[key] = {
    data,
    loading,
    error,
  };
  return newContextData;
};

export default function useInstanceData(
  instance,
  instanceStatus,
  selectedMenu,
  requestedPathHistory
) {
  const dataTypes = useMemo(
    () => ["instanceHistory", "instanceFacts", "instanceHeads", "instancePathHistory"],
    []
  );
  const [contextData, setContextData] = useState(initEmptyContextData(dataTypes));

  useEffect(() => {
    setContextData(initEmptyContextData(dataTypes));
  }, [dataTypes, instance, instanceStatus]);

  const fetchData = async (key, apiFunction) => {
    try {
      setContextData((prev) => setContextDataByKey(prev, key, null, true, null));
      const data = await apiFunction();
      setContextData((prev) => setContextDataByKey(prev, key, data, false, null));
    } catch (error) {
      setContextData((prev) => setContextDataByKey(prev, key, null, false, error));
    }
  };

  useEffect(() => {
    const data = contextData.instanceHistory.data;
    if (instance && instanceStatus && selectedMenu === "history" && data === null) {
      fetchData("instanceHistory", async () => instance.create_export());
    }
  }, [instance, instanceStatus, contextData.instanceHistory.data, selectedMenu]);

  useEffect(() => {
    const data = contextData.instanceFacts.data;
    if (instance && instanceStatus && selectedMenu === "facts" && data === null) {
      fetchData("instanceFacts", async () => instance.facts());
    }
  }, [instance, instanceStatus, contextData.instanceFacts.data, selectedMenu]);

  useEffect(() => {
    const data = contextData.instanceHeads.data;
    if (instance && instanceStatus && selectedMenu === "heads" && data === null) {
      fetchData("instanceHeads", async () => instance.trace_heads());
    }
  }, [instance, instanceStatus, contextData.instanceHeads.data, selectedMenu]);

  useEffect(() => {
    const data = contextData.instancePathHistory.data;
    if (instance && instanceStatus && requestedPathHistory && data === null) {
      fetchData("instancePathHistory", async () => instance.history());
    }
  }, [instance, instanceStatus, requestedPathHistory, contextData.instancePathHistory.data]);

  return contextData;
}

useInstanceData.propTypes = {
  instance: PropTypes.instanceOf(EFlintInstance),
  instanceStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.object]),
  selectedMenu: PropTypes.string,
  requestedHistory: PropTypes.bool,
};
