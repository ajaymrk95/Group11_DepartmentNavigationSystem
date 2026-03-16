    package com.atlas.backend.controller;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.RestController;

    import com.atlas.backend.entity.Road;
    import com.atlas.backend.repository.RoadRepository;

    import java.util.List; // Added missing import for List

    @RestController
    @RequestMapping("/api/roads")
    public class RoadController {

        @Autowired
        private RoadRepository repository;

        @GetMapping
        public List<Road> getRoads() {
            return repository.findAll();
        }
    }