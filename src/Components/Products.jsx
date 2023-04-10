import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal } from '@material-ui/core';
import axios from 'axios';

const API_URL = 'https://api-sandbox.revelup.com';
const API_KEYS = 'api_key=fe0e74c870d84630962b012c3a84f2e1&api_secret=e537e50e496f4a42aa0254bfcd3573f9439ed2a1fedd4420af453ca2cab16df3';

export default function Products() {

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'active', headerName: 'Active' },
        { field: 'price', headerName: 'Price' },
        { field: 'name', headerName: 'Name', width: 180 },
        { field: 'barcode', headerName: 'Barcode', width: 150 },
        { field: 'category', headerName: 'Category', width: 180 },
        { field: 'tax', headerName: 'Tax' }
    ];
    const [products, setProducts] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [cart, setCart] = useState({ id: 0, total: 0, discount: 0});
    const [paginationModel, setPaginationModel] = React.useState({
        pageSize: 10,
        page: 0,
    });

    useEffect( () => {
        const getProducts = async () => {
            await axios.get(`${API_URL}/resources/Product?${API_KEYS}&limit=10`).then(res => {
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

    const createCart = () => {
        const options = {
            // method: 'POST',
            // url: `${API_URL}/specialresources/cart/calculate?${API_KEYS}`,
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            data: {
                skin: 'weborder',
                items: selectedRows,
            }
        };

        axios.post(`http://localhost:5000/api/create-order`, options)
            .then(res => {
                console.log('response',res);
                setCart(res.data);
            })
            .catch(err => console.error(err));
    }

    const submitCart = () => {
        const options = {
            // method: 'POST',
            // url: `${API_URL}/specialresources/cart/submit?${API_KEYS}`,
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            data: {
                skin: 'weborder',
                items: cart,
            }
        };

        axios.post(`http://localhost:5000/api/create-order`, options)
            .then(res => {
                console.log('response',res);
                setCart(res.data);
            })
            .catch(err => console.error(err));
    }

    return (
        <div style={{ height: 400, width: '100%' }}>
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
            >
                <>
                    <h2>Cart is created!</h2>
                    <h3>Cart ID -> { cart.id }</h3>
                    <h3>Total amount to pay -> { cart.total }</h3>
                    <h3>Discount -> { cart.discount }</h3>
                    <Button
                        onClick={ submitCart }
                        variant='contained'
                        color='primary'
                        style={{ margin: '20px 0' }}
                    >
                        PAY
                    </Button>
                </>
            </Modal>
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
                />
            </>
            <Button
                onClick={createCart}
                variant='contained'
                color='primary'
                style={{ margin: '20px 0' }}
            >
                Create Cart
            </Button>
        </div>
    );
}
