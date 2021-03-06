import React, { Fragment, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import swal from 'sweetalert';

const columnas = [
    {
        name: "Id rifa",
        selector: "numero_rifa",
        sortable: true
    },
    {
        name: "Estado Compra",
        selector: "estado",
        sortable: true
    },
    {
        name: "Disponibilidad",
        selector: "disponible",
        sortable: true
    },
    {
        name: "Cliente Nombre",
        selector: "cliente_nombre",
        sortable: true
    },
    {
        name: "Cliente Apellido",
        selector: "cliente_apellido",
        sortable: true
    },
    {
        name: "Cliente Email",
        selector: "cliente_email",
        sortable: true
    },
    {
        name: "Estado Email",
        selector: "mail_estado",
        sortable: true
    },
    {
        name: "Cliente Telefono",
        selector: "cliente_telefono",
        sortable: true
    },
    {
        name: "Numero de Compra",
        selector: "compra_id",
        sortable: true
    }
]

const Dashboard = ({ setAuth }) => {
    const [name, setName] = useState("");

    const [inputs, setInputs] = useState({
        cantidadRifasAGenerar: ""
    });
    const [rifas, setRifas] = useState([]);

    const [recaudado, setRecaudado] = useState("");

    const [rifaAleatoria, setRifaAleatoria] = useState({});

    let [isWaiting, setWaiting] = useState(false);

    async function getName() {
        try {
            const response = await fetch("https://www.juntosxoscar.com.ar/dashboard/", {
                method: "GET",
                headers: { token: localStorage.token }
            });
            const parseRes = await response.json();
            setName(parseRes.nombre_usuario);
        } catch (err) {
            console.error(err.message);
        }
    }

    async function getRecaudado() {
        try {
            const response = await fetch("https://www.juntosxoscar.com.ar/rifas/total", {
                method: "GET",
            });
            const parseRes = await response.json();
            setRecaudado(parseRes.data.monto[0].total);
        } catch (err) {
            console.error(err.message + "recaudado");
        }
    }

    function verificarCamposVacios(arreglo) {
        if (arreglo instanceof Array) {
            const arrayNuevo = [];
            for (let i = 0; i < arreglo.length; i++) {
                arrayNuevo[i] = arreglo[i];

                if (arrayNuevo[i].disponible) {
                    arrayNuevo[i].disponible = "Esta disponible";
                } else {
                    arrayNuevo[i].disponible = "No esta disponible";
                }

                if (arrayNuevo[i].compra_id === null) {
                    arrayNuevo[i].compra_id = "No hay una compra hecha";
                }

                if (arrayNuevo[i].cliente_nombre === null && arrayNuevo[i].cliente_email === null &&
                    arrayNuevo[i].cliente_telefono === null && arrayNuevo[i].cliente_apellido === null) {

                    arrayNuevo[i].cliente_nombre = "No comprada";
                    arrayNuevo[i].cliente_apellido = "No comprada";
                    arrayNuevo[i].cliente_email = "No comprada";
                    arrayNuevo[i].cliente_telefono = "No comprada";
                }
                if (arrayNuevo[i].estado === null) {
                    arrayNuevo[i].estado = "No comprada";
                }
                if (arrayNuevo[i].mail_estado === null) {
                    arrayNuevo[i].mail_estado = "Nulo";
                }

            }
            return arrayNuevo;
        } else {
            TypeError("No es un array")
        }
    }

    async function getRifas() {
        try {
            const res = await fetch("https://www.juntosxoscar.com.ar/rifas", {
                method: "GET"
            });
            const parseRes = await res.json();
            if (parseRes.status === "success") {
                const arrayNuevo = verificarCamposVacios(parseRes.data.rifas);
                setRifas(arrayNuevo);
            }
        } catch (err) {
            console.error(err.message)
        }
    }

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        setAuth(false);
        toast.info("Loggeed out successfully, goodbye Fagliano")
    }

    const onChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value })
    }
    const cantidadRifasAGenerar = inputs;


    async function onClick() {
        try {
            const response = await fetch("https://www.juntosxoscar.com.ar/rifas/rifa_rand", {
                method: "GET",
            });
            const parseRes = await response.json();
            console.log(parseRes);
            setRifaAleatoria(parseRes.data);
        } catch (err) {
            console.error(err.message + "recaudado");
        }
    }
    const generarRifas = async e => {
        e.preventDefault();
        setWaiting(true);
        try {
            if (cantidadRifasAGenerar.cantidadRifasAGenerar === "" || cantidadRifasAGenerar.cantidadRifasAGenerar === '0') {
                swal({
                    title: "Ocurrio un error",
                    text: "Ocurrio un error al crear las rifas, por favor intentelo de nuevo",
                    icon: "error"
                })
                setWaiting(false);
                setInputs({ ...inputs, cantidadRifasAGenerar: "" });
            } else {
                const res = await fetch('https://www.juntosxoscar.com.ar/rifas/crear/' + cantidadRifasAGenerar.cantidadRifasAGenerar, {
                    method: "POST",
                });
                if (res.status === 200) {
                    getRifas();
                    swal({
                        title: "Creadas Correctamente",
                        text: "Cantidad de rifas creadas " + cantidadRifasAGenerar.cantidadRifasAGenerar,
                        icon: "success"
                    });
                    e.target.reset();
                    setWaiting(false);
                    setInputs({ ...inputs, cantidadRifasAGenerar: "" });
                } else {
                    swal({
                        title: "Ocurrio un error",
                        text: "Ocurrio un error al crear las rifas, por favor intentelo de nuevo",
                        icon: "error"
                    })
                    setWaiting(false);
                    setInputs({ ...inputs, cantidadRifasAGenerar: "" });
                }
                setWaiting(false);
                setInputs({ ...inputs, cantidadRifasAGenerar: "" });
            }
        } catch (err) {
            console.error(err.message);
        }
    }
    useEffect(() => {
        getName();
        getRifas();
        getRecaudado();

    }, []);
    return (
        <Fragment>
            <div className="container">
                <div className="row mt-3">
                    <h1 className="col-6">Dashboard {name}</h1>
                    <button onClick={e => logout(e)} className="btn btn-outline-danger col-6">Logout</button>
                </div>
                <div className="mt-3">
                    <h5>Recaudado : ${recaudado}</h5>
                </div>
                <div>
                    <button className="btn btn-primary" onClick={onClick}>Generar rifa aleatoria</button>
                    <p className="p-3"><b>{"Bono numero: "+rifaAleatoria.rifa} - {rifaAleatoria.nombre} - {rifaAleatoria.apellido} - {rifaAleatoria.email} -  {rifaAleatoria.telefono}</b></p>
                </div>
                <div className="row p-2 mt-3">
                    <div className="col-12 col-md-4">
                        <h3><i className="fas fa-caret-right"></i> Generar Rifas</h3>
                    </div>

                    <div className="col-12 col-md-8">
                        <form onSubmit={generarRifas} >
                            <div className="row">
                                <div className="col-6">
                                    <label htmlFor="cantidadRifasAGenerar" className="form-label"><span className="fs-6"> Ingrese la cantidad de rifas que desea generar</span></label>
                                </div>
                                <div className="col-6">
                                    <input type="number" name="cantidadRifasAGenerar" onChange={e => onChange(e)} className="form-control" />
                                </div>
                            </div>
                            <div className="text-center">
                                <button disabled={isWaiting} type="submit" className="mt-3 btn btn-success">Generar Rifas</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="row p-2 mt-3">
                    <div className="col-12">
                        <h3><i className="fas fa-caret-right"></i> Rifas</h3>
                    </div>
                    <div className="col-12 table-responsive">
                        <DataTable
                            columns={columnas}
                            data={rifas}
                            title="Informacion Sobre Las Rifas"
                            pagination
                            fixedHeader
                            theme="dark"
                            fixedHeaderScrollHeight="500px"
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Dashboard;