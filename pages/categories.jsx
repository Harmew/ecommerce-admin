import Layout from "@/components/Layout";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import { useEffect, useState } from "react";

function Categories({ swal }) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);

  async function fetchCategories() {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function saveCategory(e) {
    e.preventDefault();
    try {
      const data = {
        name,
        parentCategory,
        properties: properties.map((p) => ({
          name: p.name,
          values: p.values.split(","),
        })),
      };

      if (editedCategory) {
        await axios.put("/api/categories/", {
          ...data,
          _id: editedCategory._id,
        });
        setEditedCategory(null);
      } else await axios.post("/api/categories", data);
      setName("");
      setParentCategory("");
      setProperties([]);
      fetchCategories();
    } catch (error) {
      console.log(error);
    } finally {
      setEditedCategory(null);
    }
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  }

  function deleteCategory(category) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id);
          fetchCategories();
        }
      });
  }

  function addProperty() {
    setProperties((oldProperties) => [
      ...oldProperties,
      { name: "", values: "" },
    ]);
  }

  function handlePropertyNameChange(index, property, newName) {
    setProperties((oldProperties) => {
      const newProperties = [...oldProperties];
      newProperties[index] = { ...property, name: newName };
      return newProperties;
    });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((oldProperties) => {
      const newProperties = [...oldProperties];
      newProperties[index] = { ...property, values: newValues };
      return newProperties;
    });
  }

  function removeProperty(index) {
    setProperties((oldProperties) => {
      const newProperties = [...oldProperties];
      newProperties.splice(index, 1);
      return newProperties;
    });
  }

  return (
    <Layout>
      <h1>Categories</h1>

      <label htmlFor="name">
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create new category"}
      </label>

      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={"Category name"}
            name="name"
            id="name"
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
          <select
            value={parentCategory}
            onChange={({ target }) => setParentCategory(target.value)}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="block">Properties</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2"
          >
            Add new property
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div key={index} className="flex gap-1 mb-2">
                <input
                  type="text"
                  placeholder="property name (example: color)"
                  value={property.name}
                  className="mb-0"
                  onChange={({ target }) =>
                    handlePropertyNameChange(index, property, target.value)
                  }
                />
                <input
                  type="text"
                  className="mb-0"
                  value={property.values}
                  placeholder="values, comma separated"
                  onChange={({ target }) =>
                    handlePropertyValuesChange(index, property, target.value)
                  }
                />
                <button
                  onClick={() => removeProperty(index)}
                  type="button"
                  className="btn-red"
                >
                  Remove
                </button>
              </div>
            ))}
        </div>

        <div className="flex gap-1 ">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
              className="btn-default"
            >
              Cancel
            </button>
          )}
          <button className="btn-primary py-1" type="submit">
            Save
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td>
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-default mr-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
