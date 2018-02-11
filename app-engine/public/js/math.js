"use strict";

// return a vector from components in R3
Math.Vec3 = function(x, y, z) {
    var v = {};
    v.x = x;
    v.y = y;
    v.z = z;
    return v;
}

// return a Vec3 from spherical coordinates
Math.SpherToVec3 = function(r, theta, phi) {
    var cos = Math.cos,
        sin = Math.sin,
        x = r*cos(theta)*sin(phi),
        y = r*sin(theta)*sin(phi),
        z = r*cos(phi);
    return Math.Vec3(x,y,z);
}
