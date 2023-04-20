import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'axios';

// const API_URL = 'https://api-sandbox.revelup.com';
// const API_KEYS = 'api_key=fe0e74c870d84630962b012c3a84f2e1&api_secret=e537e50e496f4a42aa0254bfcd3573f9439ed2a1fedd4420af453ca2cab16df3';
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
    const [loading, setLoading] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [cart, setCart] = useState({ total: 0, discount: 0 });
    const [paginationModel, setPaginationModel] = React.useState({
        pageSize: 10,
        page: 0,
    });

    useEffect( () => {
        setLoading(true);
        const getProducts = async () => {
            let products = [];
            for(let i = 68109; i < 68119; i++) {
                await axios.get(`http://localhost:5000/api/get-product?id=${i}`).then(res => {
                    products.push(res.data);
                }).catch(err => {
                    console.log(err);
                })
            }
            setProducts(products);
            setLoading(false);
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
        setLoading(true);
        setErrorMessage('');
        setOrderId(0);

        let data = [];
        selectedRows.forEach(row => {
           let obj = {};
           obj.quantity = 1;
           obj.product = row.id;
           obj.price = row.price;
           data.push(obj);
        });

        const options = {
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'API-AUTHENTICATION': `${API_TOKEN}`,
            },
            mode: 'cors',
            data: {
                establishmentId: 247,
                items: data
            }
        };

        axios.post(`http://localhost:5000/api/calculate-cart`, options) //`${API_URL}/specialresources/cart/calculate`
        .then(res => {
            if(res.data.error) {
                setErrorMessage(res.data.error.details.message);
                setOpenSuccessModal(true);
            } else {
                res.data.items.forEach(el => {
                    el.id = el.product;
                });

                setCart(res.data);
                setSelectedRows(res.data.items);
                // setOpenModal(true);
            }
            setLoading(false);
        })
        .catch(err => console.error(err));
    }

    const submitCart = () => {
        setLoading(true);
        setErrorMessage('');

        selectedRows.forEach(row => {
            row.quantity = row.quantity || 1;
        });

        const options = {
            mode: 'cors',
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                // 'API-AUTHENTICATION': `${API_TOKEN}`,
            },
            data: {
                establishmentId: 247,
                items: selectedRows,
                orderInfo: {
                    asap: true,
                    call_name: 'Submit cart',
                    dining_option: 0
                },
                paymentInfo: {
                    type: 4,
                    amount: cart.final_total,
                    tip: 0
                }
            }
        };

        axios.post(`http://localhost:5000/api/submit-cart`, options) //`${API_URL}/specialresources/cart/submit`
            .then(res => {
                if(res.data.error) {
                    setErrorMessage(res.data.error.details.message);
                    setOpenSuccessModal(true);
                } else {
                    setOrderId(res.data.orderId);
                    setErrorMessage('');
                }
                setCart({ total: 0, discount: 0 });
                setLoading(false);
            })
            .catch(err => console.error(err));
    }

    return (
        <div style={{ height: 400, width: '100%' }}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                onClick={() => setLoading(false)}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Modal
                open={openSuccessModal}
                onClose={() => setOpenSuccessModal(false)}
            >
                <div className='modal'>
                    { errorMessage &&
                        <Typography id="modal-description" variant="body1" gutterBottom>
                            <h3>{ errorMessage }</h3>
                        </Typography>
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
            { cart.final_total && !orderId && !errorMessage &&
                <div>
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
            }
            { !errorMessage && orderId ?
                <div>
                    <Typography id="modal-title" variant="h5" gutterBottom>
                        Assuming Revel supports it!
                    </Typography>
                    <Typography id="modal-description" variant="body1" gutterBottom>
                        <h3>Order ID -> { orderId }</h3>
                    </Typography>
                </div>
                :
                <> </>
            }
        </div>
    );
}
