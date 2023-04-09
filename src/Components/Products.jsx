import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from "axios";

const API_URL = 'https://api-sandbox.revelup.com';
const API_KEYS = 'api_key=fe0e74c870d84630962b012c3a84f2e1&api_secret=e537e50e496f4a42aa0254bfcd3573f9439ed2a1fedd4420af453ca2cab16df3';

const columns = [
    { field: 'id', headerName: 'ID' },
    { field: 'active', headerName: 'Active' },
    { field: 'price', headerName: 'Price' },
    { field: 'name', headerName: 'Name' },
    { field: 'tax', headerName: 'Tax' },
    { field: 'barcode', headerName: 'Barcode' },
    { field: 'category', headerName: 'Category' },
];

export default function Products() {

    const [products, setProducts] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [paginationModel, setPaginationModel] = React.useState({
        pageSize: 10,
        page: 0,
    });

    useEffect( () => {
        const getProducts = async () => {
            await axios.get(`${API_URL}/resources/Product?${API_KEYS}&limit=10`).then(res => {
                console.log(res.data.objects);
                setProducts(res.data.objects);
            }).catch(err => {
                console.log(err);
            })
        };

        getProducts();
    }, []);


    const selectRows = (ids) => {
        const rows = products.filter(product => {
            return ids.includes(product.id);
        });
        setSelectedRows(rows);
    }

    return (
        <div style={{ height: 400, width: '100%' }}>
            <>
                <h2>Revel Catalog</h2>
                <DataGrid
                    rows={products}
                    columns={columns}
                    pageSize={1}
                    rowsPerPageOptions={[2]}
                    checkboxSelection
                    onRowSelectionModelChange={selectRows}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                />
            </>
            <>
                <h2>Selected Basket</h2>
                <DataGrid
                    rows={selectedRows}
                    columns={columns}
                    // pageSize={5}
                    // rowsPerPageOptions={[5]}
                />
            </>
        </div>
    );
}
