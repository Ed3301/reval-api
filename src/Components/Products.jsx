import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import axios from 'axios';

const API_URL = 'https://api-sandbox.revelup.com';
const API_KEYS = 'api_key=fe0e74c870d84630962b012c3a84f2e1&api_secret=e537e50e496f4a42aa0254bfcd3573f9439ed2a1fedd4420af453ca2cab16df3';
const API_TOKEN = 'fe0e74c870d84630962b012c3a84f2e1:e537e50e496f4a42aa0254bfcd3573f9439ed2a1fedd4420af453ca2cab16df3';

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
    const [orderId, setOrderId] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [cart, setCart] = useState({ total: 0, discount: 0 });
    const [paginationModel, setPaginationModel] = React.useState({
        pageSize: 10,
        page: 0,
    });

    useEffect( () => {
        const getProducts = async () => {
            await axios.get(`${API_URL}/resources/Product?${API_KEYS}&limit=20&offset=64510`).then(res => {
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

    const calculateCart = () => {
        setErrorMessage('');

        let data = [];
        selectedRows.forEach(row => {
           let obj = {};
           obj.quantity = 1;
           obj.product = row.id;
           obj.price = row.price;
           data.push(obj);
        });

        const options = {
            // method: 'POST',
            // url: `${API_URL}/specialresources/cart/submit`,
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                // 'API-AUTHENTICATION': `${API_TOKEN}`,
            },
            data: {
                establishmentId: 247,
                items: data
            }
        };

        axios.post(`http://localhost:5000/api/calculate-cart`, options) //`${API_URL}/specialresources/cart/calculate`
        .then(res => {
            console.log('response',res.data);
            if(res.data.error) {
                setErrorMessage(res.data.error.details.message);
                setOpenSuccessModal(true);
            } else {
                res.data.items.forEach(el => {
                    el.id = el.product;
                });

                setCart(res.data);
                setSelectedRows(res.data.items);
                setOpenModal(true);
            }
        })
        .catch(err => console.error(err));
    }

    const submitCart = () => {
        setOpenModal(false);
        setErrorMessage('');

        selectedRows.forEach(row => {
            row.quantity = row.quantity || 1;
        });

        const options = {
            // method: 'POST',
            // url: `${API_URL}/specialresources/cart/submit`,
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'API-AUTHENTICATION': `${API_TOKEN}`,
            },
            data: {
                establishmentId: 247,
                items: selectedRows,
                orderInfo: {
                    asap: true,
                    call_name: 'Submit cart',
                    dining_option: 0 //[0, 1, 2, 3, 4, 5, 6, 7]
                }
            }
        };

        axios.post(`http://localhost:5000/api/submit-cart`, options) //`${API_URL}/specialresources/cart/submit`
            .then(res => {
                console.log('response',res.data);
                if(res.data.error) {
                    setErrorMessage(res.data.error.details.message);
                    setOpenSuccessModal(true);
                } else {
                    setOrderId(res.data.orderId);
                    setOpenSuccessModal(true);
                }
            })
            .catch(err => console.error(err));
    }

    return (
        <div style={{ height: 400, width: '100%' }}>
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
            >
                <div className='modal'>
                    <Typography id="modal-title" variant="h4" gutterBottom>
                        Cart is created!
                    </Typography>
                    <Typography id="modal-description" variant="body1" gutterBottom>
                        <h3>Total amount to pay -> { cart.final_total }</h3>
                        <h3>Discount -> { cart.discounts || 0 }</h3>
                        <Button
                            onClick={ submitCart }
                            variant='contained'
                            color='primary'
                            style={{ margin: '20px 0' }}
                        >
                            PAY
                        </Button>
                    </Typography>
                </div>
            </Modal>
            <Modal
                open={openSuccessModal}
                onClose={() => setOpenSuccessModal(false)}
            >
                <div className='modal'>
                    { errorMessage ?
                        <Typography id="modal-description" variant="body1" gutterBottom>
                            <h3>{ errorMessage }</h3>
                        </Typography>
                        :
                        <>
                            <Typography id="modal-title" variant="h5" gutterBottom>
                                Assuming Revel supports it!
                            </Typography>
                            <Typography id="modal-description" variant="body1" gutterBottom>
                                <h3>Order ID -> { orderId }</h3>
                            </Typography>
                        </>
                    }
                </div>
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
                onClick={calculateCart}
                variant='contained'
                color='primary'
                style={{ margin: '20px 0' }}
            >
                Create Cart
            </Button>
        </div>
    );
}
