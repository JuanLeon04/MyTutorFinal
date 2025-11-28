package uis.mytutor.servicio.interfaz;

import uis.mytutor.dto.SolicitudTutor;
import uis.mytutor.modelo.Tutor;

import java.util.List;

public interface ITutorServicio {

    // Obtener tutores
    List<Tutor> getTutores();

    // Crear tutor
    Tutor crearTutor(SolicitudTutor solicitud);
}
