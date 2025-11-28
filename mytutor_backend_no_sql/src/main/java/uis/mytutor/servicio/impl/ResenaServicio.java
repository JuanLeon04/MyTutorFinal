package uis.mytutor.servicio.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import uis.mytutor.dto.ModificarResena;
import uis.mytutor.dto.ResenasDTO;
import uis.mytutor.modelo.*;
import uis.mytutor.repositorio.HorarioRepositorio;
import uis.mytutor.repositorio.UsuarioRepositorio;
import uis.mytutor.dto.SolicitudResena;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResenaServicio {

    @Autowired
    private HorarioRepositorio horarioRepositorio;

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    // Obtener reseñas de un Tutor por su id
    public List<Resena> getResenasDeTutorPorId(String idTutor) {
        Usuario tutor = usuarioRepositorio.findById(idTutor)
                .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));

        if (tutor.getRol() != Usuario.Rol.TUTOR || tutor.getTutor() == null) {
            throw new RuntimeException("El usuario encontrado no es un tutor válido");
        }

        // Si no tiene reseñas, se devuelve lista vacía
        return tutor.getTutor().getResenas() != null
                ? tutor.getTutor().getResenas()
                : new ArrayList<>();
    }



    // Obtener las reseñas que un usuario haya hecho
    public List<ResenasDTO> obtenerResenasHechas(Usuario usuarioQueSolicita) {

        // Obtener todos los usuarios que sean TUTORES
        List<Usuario> tutores = usuarioRepositorio.findAll()
                .stream()
                .filter(u -> u.getRol() == Usuario.Rol.TUTOR && u.getTutor() != null)
                .toList();

        List<ResenasDTO> resultado = new ArrayList<>();

        for (Usuario tutor : tutores) {
            Tutor datosTutor = tutor.getTutor();

            // Si no tiene reseñas continuar
            if (datosTutor.getResenas() == null) continue;

            // Revisar reseñas hechas por este usuario
            datosTutor.getResenas().stream()
                    .filter(r -> r.getAutorId().equals(usuarioQueSolicita.getId()))
                    .forEach(r -> {
                        ResenasDTO dto = new ResenasDTO();
                        dto.setId(r.getIdResena());
                        dto.setIdTutor(tutor.getId());
                        dto.setTutorNombreApellido(tutor.getNombre() + " " + tutor.getApellido());
                        dto.setPuntuacion(r.getPuntuacion());
                        dto.setComentario(r.getComentario());

                        resultado.add(dto);
                    });
        }

        return resultado;
    }



    //Obtener reseña por id
    public ResenasDTO obtenerResenaPorId(String idResena) {

        // 1. Buscar entre todos los usuarios que son tutores
        Usuario tutorUsuario = usuarioRepositorio.findAll().stream()
                .filter(u -> u.getRol() == Usuario.Rol.TUTOR && u.getTutor() != null)
                .filter(u -> u.getTutor().getResenas() != null)
                .filter(u -> u.getTutor().getResenas().stream()
                        .anyMatch(r -> r.getIdResena().equals(idResena)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));

        // 2. Obtener la reseña dentro de ese tutor
        Resena resena = tutorUsuario.getTutor().getResenas().stream()
                .filter(r -> r.getIdResena().equals(idResena))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada (inconsistencia)"));

        // 3. Mapear el DTO
        ResenasDTO dto = new ResenasDTO();
        dto.setId(resena.getIdResena());
        dto.setIdTutor(tutorUsuario.getId());
        dto.setTutorNombreApellido(tutorUsuario.getNombre() + " " + tutorUsuario.getApellido());
        dto.setComentario(resena.getComentario());
        dto.setPuntuacion(resena.getPuntuacion());

        return dto;
    }



    // Actualizar y obtener la califiación promedio de todas las reseñas (Uso solo en el back)
    // Colocar el promedio de todas las resenas en Usuario.Tutor.califiacionPromedio
    public double obtenerPromedioResenasDeTutor(String idTutor) {

        // Buscar usuario/tutor
        Usuario tutor = usuarioRepositorio.findById(idTutor)
                .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));

        // Validar que realmente sea un tutor
        if (tutor.getRol() != Usuario.Rol.TUTOR || tutor.getTutor() == null) {
            throw new RuntimeException("El usuario no es un tutor válido");
        }

        Tutor datosTutor = tutor.getTutor();

        // Si no tiene reseñas → promedio 5.0
        if (datosTutor.getResenas() == null || datosTutor.getResenas().isEmpty()) {
            datosTutor.setCalifiacionPromedio(5.0);
            usuarioRepositorio.save(tutor);
            return 5.0;
        }

        // Calcular promedio
        double promedio = datosTutor.getResenas().stream()
                .mapToInt(Resena::getPuntuacion)
                .average()
                .orElse(0.0);

        // Guardar promedio dentro del tutor
        datosTutor.setCalifiacionPromedio(promedio);
        usuarioRepositorio.save(tutor);

        return promedio;
    }


    // Generar una reseña a un tutor apartir de una horario finalizado
    // EL usuario solicitante debe haber visto una tutoría con el tutor
    //      Horario.Reserva.estado == COMPLETADA
    // Calificación de 0 - 5
    // Usar obtenerPromedioResenasDeTutor(String idTutor) al finalizar
    public Resena crearResena(Usuario usuarioQueSolicita, SolicitudResena solicitud) {
        // Buscar horario
        Horario horario = horarioRepositorio.findById(solicitud.getIdHorario())
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

        // Validamos puntuación
        if (solicitud.getPuntuacion() == null || solicitud.getPuntuacion() < 0 || solicitud.getPuntuacion() > 5) {
            throw new RuntimeException("La calificación debe estar entre 0 y 5.");
        }

        // Buscar la reserva que hizo este usuario
        Reserva reservaDelUsuario = horario.getHistorialReservas().stream()
                .filter(r -> r.getIdUsuario().equals(usuarioQueSolicita.getId()))
                .max(Comparator.comparing(Reserva::getFecha))
                .orElseThrow(() -> new RuntimeException("El usuario no ha reservado este horario."));


        // Validar que la reserva esté COMPLETADA
        if (reservaDelUsuario.getEstado() != Reserva.EstadoReserva.COMPLETADA) {
            throw new RuntimeException("Solo puedes crear reseñas de tutorías COMPLETADAS.");
        }

        // Obtener el tutor
        Usuario tutorUsuario = usuarioRepositorio.findById(horario.getIdTutor()).orElseThrow(() -> new RuntimeException("Tutor no encontrado"));;

        // Validar que el usuario sea realmente un tutor
        if (tutorUsuario.getRol() != Usuario.Rol.TUTOR || tutorUsuario.getTutor() == null) {
            throw new RuntimeException("El usuario asociado al horario no es un tutor válido.");
        }

        // Crear la reseña
        Resena nuevaResena = new Resena();
        nuevaResena.setAutorId(usuarioQueSolicita.getId());
        nuevaResena.setPuntuacion(solicitud.getPuntuacion());
        nuevaResena.setComentario(solicitud.getComentario());
        nuevaResena.setFecha(LocalDateTime.now());

        // Inicializar lista de reseñas si no existe
        if (tutorUsuario.getTutor().getResenas() == null) {
            tutorUsuario.getTutor().setResenas(new ArrayList<>());
        }

        // Agregar reseña al tutor
        tutorUsuario.getTutor().getResenas().add(nuevaResena);

        // Guardar tutor actualizado
        usuarioRepositorio.save(tutorUsuario);

        // Actualizar promedio
        this.obtenerPromedioResenasDeTutor(tutorUsuario.getId());

        return nuevaResena;
    }



    // Actualizar reseña por id
    // Un usuario solo puede editar las reseñas hechas por él
    public ResenasDTO modificarResena(Usuario usuarioQueSolicita, ModificarResena solicitud) {

        // 1. Buscar usuario cuya sección "tutor" contenga esta reseña
        Usuario usuarioTutor = usuarioRepositorio.findAll()
                .stream()
                .filter(u -> u.getTutor() != null &&
                        u.getTutor().getResenas() != null &&
                        u.getTutor().getResenas()
                                .stream()
                                .anyMatch(r -> r.getIdResena().equals(solicitud.getId())))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No existe ninguna reseña con ese ID"));

        // 2. Obtener la reseña dentro de la lista
        Resena resena = usuarioTutor.getTutor().getResenas().stream()
                .filter(r -> r.getIdResena().equals(solicitud.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada dentro del usuario tutor"));

        // 3. Validar que quien solicita ES el autor
        if (!resena.getAutorId().equals(usuarioQueSolicita.getId())) {
            throw new RuntimeException("No tienes permiso para editar esta reseña");
        }

        // 4. Actualizar la información
        if (solicitud.getPuntuacion() != null) {
            resena.setPuntuacion(solicitud.getPuntuacion());
        }

        if (solicitud.getComentario() != null) {
            resena.setComentario(solicitud.getComentario());
        }

        // 5. Guardar el usuario que contiene la reseña
        usuarioRepositorio.save(usuarioTutor);

        // 6. Construir DTO de respuesta
        ResenasDTO dto = new ResenasDTO();
        dto.setId(resena.getIdResena());
        dto.setComentario(resena.getComentario());
        dto.setPuntuacion(resena.getPuntuacion());
        dto.setIdTutor(usuarioTutor.getId());
        dto.setTutorNombreApellido(usuarioTutor.getNombre() + " " + usuarioTutor.getApellido());

        return dto;
    }


}
