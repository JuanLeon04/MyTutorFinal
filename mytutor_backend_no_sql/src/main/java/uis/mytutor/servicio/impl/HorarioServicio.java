package uis.mytutor.servicio.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uis.mytutor.dto.SolicitudHorario;
import uis.mytutor.modelo.Horario;
import uis.mytutor.modelo.Usuario;
import uis.mytutor.repositorio.HorarioRepositorio;
import uis.mytutor.dto.HorarioDisponibleDTO;
import uis.mytutor.repositorio.UsuarioRepositorio;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HorarioServicio {

    @Autowired
    HorarioRepositorio horarioRepositorio;

    @Autowired
    UsuarioRepositorio usuarioRepositorio;

    // Mapear el Horario al DTO para entregar al front
    public HorarioDisponibleDTO mapToHorarioDisponibleDTO(Horario horario) {

        // Buscar el usuario/tutor
        Usuario tutorUsuario = usuarioRepositorio.findById(horario.getIdTutor())
                .orElseThrow(() -> new RuntimeException("Tutor no encontrado"));

        // Validar que sea tutor y que tenga objeto Tutor
        if (tutorUsuario.getRol() != Usuario.Rol.TUTOR || tutorUsuario.getTutor() == null) {
            return null;
        }

        // Validar que el horario esté disponible
        if (!horario.isDisponible()) return null; // skip

        // Crear DTO
        HorarioDisponibleDTO dto = new HorarioDisponibleDTO();
        dto.setId(horario.getId());
        dto.setIdTutor(horario.getIdTutor());
        dto.setFechaInicio(horario.getFechaInicio());
        dto.setFechaFin(horario.getFechaFin());

        // Datos del tutor
        dto.setTutorNombreApellido(
                tutorUsuario.getNombre() + " " + tutorUsuario.getApellido()
        );
        dto.setPrecioHora(tutorUsuario.getTutor().getPrecioHora());
        dto.setCalifiacionPromedio(tutorUsuario.getTutor().getCalifiacionPromedio());
        dto.setMaterias(tutorUsuario.getTutor().getMaterias());

        return dto;
    }


    // Obtener todos los horarios
    public List<Horario> obtenerTodosLosHorarios(){
        List<Horario> horarios = new ArrayList<>();
        horarios = horarioRepositorio.findAll();
        return horarios;
    }

    // Obtener todos los horarios disponibles
    public List<HorarioDisponibleDTO> obtenerTodosLosHorariosDisponibles(){
        return horarioRepositorio.findAll()
                .stream()
                .map(this::mapToHorarioDisponibleDTO)
                .collect(Collectors.toList());
    }


    // Busqueda de texto sin tildes
    private String normalizar(String texto) {
        if (texto == null) return null;

        return Normalizer
                .normalize(texto, Normalizer.Form.NFD) // separa caracteres base + tildes
                .replaceAll("\\p{M}", "")               // elimina tildes
                .toLowerCase()                          // pasa a minúsculas
                .trim();
    }
    // Obtener horarios según filtros
    public List<HorarioDisponibleDTO> obtenerHorariosFiltrados(
            String materia,
            Double precioMin,
            Double precioMax,
            Double calificacionMin,
            Double calificacionMax,
            String nombreTutor,
            LocalDateTime fechaInicioFiltro,
            LocalDateTime fechaFinFiltro
    ) {

        List<HorarioDisponibleDTO> horarios = obtenerTodosLosHorariosDisponibles();

        return horarios.stream()

                /* ---------------- FILTRO POR MATERIA (sin tildes) ---------------- */
                .filter(dto -> materia == null || materia.isEmpty() ||
                        (dto.getMaterias() != null &&
                                dto.getMaterias().stream().anyMatch(m ->
                                        m.getNombre() != null &&
                                                normalizar(m.getNombre()).contains(normalizar(materia))
                                )
                        )
                )

                /* ---------------- FILTRO POR PRECIO ---------------- */
                .filter(dto -> precioMin == null || dto.getPrecioHora() >= precioMin)
                .filter(dto -> precioMax == null || dto.getPrecioHora() <= precioMax)

                /* ---------------- FILTRO POR CALIFICACIÓN ---------------- */
                .filter(dto -> calificacionMin == null || dto.getCalifiacionPromedio() >= calificacionMin)
                .filter(dto -> calificacionMax == null || dto.getCalifiacionPromedio() <= calificacionMax)

                /* ---------------- FILTRO POR NOMBRE DEL TUTOR (sin tildes, partial match) ---------------- */
                .filter(dto -> {
                    if (nombreTutor == null || nombreTutor.isEmpty()) return true;

                    String buscar = normalizar(nombreTutor);
                    String nombreCompleto = normalizar(dto.getTutorNombreApellido());

                    return nombreCompleto.contains(buscar);
                })

                /* ---------------- FILTRO POR FECHAS ---------------- */
                .filter(dto -> {
                    if (fechaInicioFiltro == null && fechaFinFiltro == null) return true;

                    LocalDateTime inicio = dto.getFechaInicio();
                    LocalDateTime fin = dto.getFechaFin();

                    boolean cumpleInicio = (fechaInicioFiltro == null || !inicio.isBefore(fechaInicioFiltro));
                    boolean cumpleFin = (fechaFinFiltro == null || !fin.isAfter(fechaFinFiltro));

                    return cumpleInicio && cumpleFin;
                })

                .collect(Collectors.toList());
    }


    // Obtener mis horarios como tutor
    public List<Horario> obtenerHorariosTutor(Usuario usuarioActual) {
        // Validar que el usuario sea TUTOR
        if (usuarioActual.getRol() != Usuario.Rol.TUTOR || usuarioActual.getTutor() == null) {
            throw new RuntimeException("Solo un tutor puede obtener sus horarios.");
        }
        return horarioRepositorio.findByIdTutor(usuarioActual.getId());
    }


    // Que el tutor cree un horario de tutoría
    public Horario crearHorarioTutoria(Usuario usuarioActual, SolicitudHorario nuevoHorario) {

        // Validar que el usuario sea TUTOR
        if (usuarioActual.getRol() != Usuario.Rol.TUTOR || usuarioActual.getTutor() == null) {
            throw new RuntimeException("Solo un tutor puede crear horarios.");
        }

        // Validar fechas
        if (nuevoHorario.getFechaInicio() == null || nuevoHorario.getFechaFin() == null ||
                !nuevoHorario.getFechaFin().isAfter(nuevoHorario.getFechaInicio())) {
            throw new RuntimeException("Las fechas del horario no son válidas.");
        }

        // Validar que el tutor que solicita no tenga ya alguna tutoría que se cruce con la actual
        // asi tenga disponible=false
        List<Horario> solapados = horarioRepositorio.encontrarHorariosSolapados(
                usuarioActual.getId(),
                nuevoHorario.getFechaInicio(),
                nuevoHorario.getFechaFin()
        );
        if (!solapados.isEmpty()) {
            throw new RuntimeException("Ya existe un horario que se cruza con el rango proporcionado.");
        }


        // Validar que la sea Fecha real y posible (No se puede crear una reserva en una fecha que ya paso)
        LocalDateTime ahora = LocalDateTime.now();
        if (!ahora.isBefore(nuevoHorario.getFechaInicio())) {
            throw new IllegalArgumentException("No se puede crear un horario en una fecha pasada o en el mismo instante");
        }

        // Crear el horario
        Horario horario = new Horario();
        horario.setIdTutor(usuarioActual.getId());
        horario.setFechaInicio(nuevoHorario.getFechaInicio());
        horario.setFechaFin(nuevoHorario.getFechaFin());
        horario.setDisponible(true);

        return horarioRepositorio.save(horario);
    }


    // Que el tutor modifique el horario de una tutoría por id del horario
    public Horario modificarHorarioTutoria(Usuario usuarioActual, String idHorario, SolicitudHorario datosActualizados) {

        // Validar rol del usuario
        if (usuarioActual.getRol() != Usuario.Rol.TUTOR || usuarioActual.getTutor() == null) {
            throw new RuntimeException("Solo un tutor puede modificar horarios.");
        }

        // Buscar el horario
        Horario horario = horarioRepositorio.findById(idHorario)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

        // Validar que el horario pertenezca al tutor actual
        if (!horario.getIdTutor().equals(usuarioActual.getId())) {
            throw new RuntimeException("No puedes modificar un horario que no te pertenece.");
        }

        // Validar que la sea Fecha real y posible (No se puede modificar una tutoria si ya pasó)
        LocalDateTime ahora = LocalDateTime.now();
        if (!ahora.isBefore(datosActualizados.getFechaInicio())) {
            throw new IllegalArgumentException("No se puede modificar un horario de una tutoria pasada");
        }

        // Validar fechas si vienen
        if (datosActualizados.getFechaInicio() != null) {
            horario.setFechaInicio(datosActualizados.getFechaInicio());
        }

        if (datosActualizados.getFechaFin() != null) {
            horario.setFechaFin(datosActualizados.getFechaFin());
        }

        if (!horario.getFechaFin().isAfter(horario.getFechaInicio())) {
            throw new RuntimeException("Las fechas del horario no son válidas.");
        }

        return horarioRepositorio.save(horario);
    }


    // Que el tutor soft delete un horario poniendo disponible en false
    public boolean desactivarHorarioTutoria(Usuario usuarioActual, String idHorario) {

        // Validar rol del usuario
        if (usuarioActual.getRol() != Usuario.Rol.TUTOR || usuarioActual.getTutor() == null) {
            throw new RuntimeException("Solo un tutor puede desactivar sus horarios.");
        }

        // Buscar horario
        Horario horario = horarioRepositorio.findById(idHorario)
                .orElse(null);

        if (horario == null) {
            return false;
        }

        // Validar propiedad del horario
        if (!horario.getIdTutor().equals(usuarioActual.getId())) {
            throw new RuntimeException("No puedes desactivar un horario que no es tuyo.");
        }

        // Soft delete
        horario.setDisponible(false);
        horarioRepositorio.save(horario);

        return true;
    }

}
