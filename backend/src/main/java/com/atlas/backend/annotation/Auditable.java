package com.atlas.backend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String action();        // "CREATE", "UPDATE", "DELETE"
    String entityType();    // "Faculty", "Building", "Room", "Floor"
}