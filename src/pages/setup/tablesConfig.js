const tablesConfig = {
    properties: {
      title: "Property",
      endpointGet: "propertyGetProperties.php",
      endpointAdd: "propertyAdd.php",
      endpointEdit: "propertyEdit.php",
      endpointDelete: "propertyDelete.php",
      columns: [
        { key: "id", label: "Id", type: 'text' },
        { key: "name", label: "Name", type: 'text' },
        { key: "typeName", label: "Type" },
        //{ key: 'propertytype_id', label: 'Property Type', type: 'select', options: propertyTypes },
        { key: "values_list", label: "Value list", type: 'text' },
      ],
      initialObject: { id: 0, name: "", values_list: "", propertytype_id: "" },
    },
    // Add more tables here
    objecttypes: {
      title: "Object Type",
      endpointGet: "objecttypeGetObjecttypes.php",
      endpointAdd: "objecttypeAdd.php",
      endpointEdit: "objecttypeEdit.php",
      endpointDelete: "objecttypeDelete.php",
      columns: [
        { key: "typeId", label: "Id" },
        { key: "typeName", label: "Name", type: 'text' },
        { key: "category", label: "Category", type: 'text' },
      ],
      initialObject: { id: 0, name: "", category: "" },
    },
  };
  
  export default tablesConfig;
  